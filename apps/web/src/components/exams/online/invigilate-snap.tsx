"use client";

import {
  INVIGILATE_USER_TYPE,
  type InvigilateJsonObject,
  type InvigilateSocketMessage,
} from "@workspace/api";
import { Camera, MonitorUp, WifiOff } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  buildInvigilateWebSocketBaseUrl,
  buildInvigilateWebSocketUrl,
  createOnlineExamBrowserApi,
  getBrowserExamToken,
  getOnlineInvigilateConfig,
  normalizeInvigilateAnswer,
  parseInvigilateJsonObject,
  parseInvigilatePeerList,
  parseInvigilateSocketMessage,
} from "@/core/exams";
import type {
  ExamOnlineSession,
  OnlineInvigilateUserProfile,
} from "@/core/exams";

export interface OnlineInvigilateSnapHandle {
  userLeave: () => Promise<void>;
}

interface OnlineInvigilateSnapProps {
  session: ExamOnlineSession;
  profile: OnlineInvigilateUserProfile | null | undefined;
  onForceSubmit: () => void;
}

const INVIGILATE_PEER_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: "stun:119.29.209.39:3478" },
    {
      urls: "turn:119.29.209.39:3478",
      username: "mlkj",
      credential: "gs2vvsls8c",
    },
  ],
  iceTransportPolicy: "all",
};

const toInvigilateJsonObject = (
  value: RTCSessionDescriptionInit | RTCIceCandidate
): InvigilateJsonObject =>
  "toJSON" in value
    ? (value.toJSON() as InvigilateJsonObject)
    : (value as unknown as InvigilateJsonObject);

export const OnlineInvigilateSnap = forwardRef<
  OnlineInvigilateSnapHandle,
  OnlineInvigilateSnapProps
>(({ session, profile, onForceSubmit }, ref) => {
  const config = useMemo(
    () => getOnlineInvigilateConfig(session.detail),
    [session.detail]
  );
  const apiRef = useRef(createOnlineExamBrowserApi());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const peerMapRef = useRef(new Map<string, RTCPeerConnection>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const leftRef = useRef(false);
  const forceSubmitRef = useRef(onForceSubmit);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [invigilateMessage, setInvigilateMessage] = useState<string | null>(null);

  useEffect(() => {
    forceSubmitRef.current = onForceSubmit;
  }, [onForceSubmit]);

  const closePeers = useCallback(() => {
    for (const peer of peerMapRef.current.values()) {
      peer.close();
    }
    peerMapRef.current.clear();
  }, []);

  const stopSocket = useCallback(() => {
    if (heartbeatRef.current !== null) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const userLeave = useCallback(async () => {
    closePeers();
    stopSocket();

    if (!config.invigilateEnable || leftRef.current) {
      return;
    }

    leftRef.current = true;
    await apiRef.current.invigilate.handleUserLeave({
      userType: INVIGILATE_USER_TYPE.EXAMINEE,
      examId: session.examId,
    });
  }, [closePeers, config.invigilateEnable, session.examId, stopSocket]);

  useImperativeHandle(ref, () => ({ userLeave }), [userLeave]);

  const takePhoto = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!video || !canvas || !context || !video.videoWidth || !video.videoHeight) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    await apiRef.current.exam.uploadExamSnap({
      userExamId: session.userExamId,
      base64Img: canvas.toDataURL("image/png"),
    });
  }, [session.userExamId]);

  const attachLocalTracks = useCallback((peer: RTCPeerConnection) => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    for (const track of stream.getTracks()) {
      peer.addTrack(track, stream);
    }
  }, []);

  const createOfferForInvigilator = useCallback(
    async (toUserId: string) => {
      if (!profile?.id || !toUserId || typeof RTCPeerConnection === "undefined") {
        return;
      }

      let peer = peerMapRef.current.get(toUserId);
      if (!peer) {
        peer = new RTCPeerConnection(INVIGILATE_PEER_CONFIGURATION);
        peerMapRef.current.set(toUserId, peer);
      }

      peer.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        void apiRef.current.invigilate.handleCandidate({
          fromUserId: profile.id,
          toUserId,
          candidate: toInvigilateJsonObject(event.candidate),
          examId: session.examId,
        });
      };

      attachLocalTracks(peer);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      await apiRef.current.invigilate.handleOffer({
        fromUserId: profile.id,
        toUserId,
        offer: toInvigilateJsonObject(offer),
        examId: session.examId,
      });
    },
    [attachLocalTracks, profile?.id, session.examId]
  );

  const configureAnswer = useCallback(
    async (
      fromUserId: string | undefined,
      value: InvigilateSocketMessage["msgTxt"]
    ) => {
      if (!fromUserId) {
        return;
      }

      const answer = normalizeInvigilateAnswer(value);
      const peer = peerMapRef.current.get(fromUserId);

      if (!answer || !peer) {
        return;
      }

      await peer.setRemoteDescription(
        answer as unknown as RTCSessionDescriptionInit
      );
    },
    []
  );

  const handleCandidate = useCallback(
    async (
      fromUserId: string | undefined,
      value: InvigilateSocketMessage["msgTxt"]
    ) => {
      if (!fromUserId) {
        return;
      }

      const candidate = parseInvigilateJsonObject(value);
      const peer = peerMapRef.current.get(fromUserId);

      if (!candidate || !peer) {
        return;
      }

      await peer.addIceCandidate(candidate as RTCIceCandidateInit);
    },
    []
  );

  const handleSocketMessage = useCallback(
    (message: InvigilateSocketMessage) => {
      if (message.msgType === "createPeerOfferInvigilate") {
        void createOfferForInvigilator(String(message.msgTxt ?? ""));
        return;
      }

      if (message.msgType === "createPeerOfferInvigilateList") {
        for (const invigilatorId of parseInvigilatePeerList(message.msgTxt)) {
          void createOfferForInvigilator(invigilatorId);
        }
        return;
      }

      if (message.msgType === "handleAnswer") {
        void configureAnswer(message.fromUserId, message.msgTxt);
        return;
      }

      if (message.msgType === "handleCandidate") {
        void handleCandidate(message.fromUserId, message.msgTxt);
        return;
      }

      if (message.msgType === "removePeerInvigilate") {
        const userId = String(message.msgTxt ?? "");
        peerMapRef.current.get(userId)?.close();
        peerMapRef.current.delete(userId);
        return;
      }

      if (message.msgType === "sendMessageToExaminee") {
        setInvigilateMessage(String(message.msgTxt ?? ""));
        return;
      }

      if (message.msgType === "forceSubmitExam") {
        forceSubmitRef.current();
      }
    },
    [configureAnswer, createOfferForInvigilator, handleCandidate]
  );

  useEffect(() => {
    if (!config.snapOn && !config.invigilateEnable) {
      return;
    }

    let cancelled = false;
    let snapTimer: number | null = null;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("当前浏览器不支持摄像头监考。");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (config.snapOn) {
          snapTimer = window.setInterval(() => {
            void takePhoto();
          }, config.snapIntervalMs);
        }
      } catch {
        setCameraError("摄像头启动失败，请检查浏览器权限。");
      }
    };

    void startCamera();

    return () => {
      cancelled = true;

      if (snapTimer !== null) {
        window.clearInterval(snapTimer);
      }

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    };
  }, [
    config.invigilateEnable,
    config.snapIntervalMs,
    config.snapOn,
    takePhoto,
  ]);

  useEffect(() => {
    if (!config.invigilateEnable || !profile?.id) {
      return;
    }

    const baseUrl = buildInvigilateWebSocketBaseUrl(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL,
      process.env.NEXT_PUBLIC_API_BASE_URL
    );
    const token = getBrowserExamToken();
    const socketUrl = buildInvigilateWebSocketUrl({
      baseUrl,
      userId: profile.id,
      token,
    });

    if (!socketUrl) {
      setSocketError("未配置监考 WebSocket 地址。");
      return;
    }

    let closedByEffect = false;
    let reconnectCount = 0;

    const connect = () => {
      const socket = token
        ? new WebSocket(socketUrl, [token])
        : new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectCount = 0;
        setSocketError(null);
        heartbeatRef.current = window.setInterval(() => {
          socket.send("ping");
        }, 55_000);

        window.setTimeout(() => {
          void apiRef.current.invigilate.userJoin({
            userExamId: session.userExamId,
            examId: session.examId,
            userType: INVIGILATE_USER_TYPE.EXAMINEE,
          });
        }, 500);
      };

      socket.onmessage = (event) => {
        const message = parseInvigilateSocketMessage(String(event.data));
        if (message) {
          handleSocketMessage(message);
        }
      };

      socket.onerror = () => {
        setSocketError("监考 WebSocket 连接异常。");
      };

      socket.onclose = () => {
        if (heartbeatRef.current !== null) {
          window.clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        if (closedByEffect || reconnectCount >= 5) {
          return;
        }

        reconnectCount += 1;
        reconnectTimerRef.current = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      void userLeave();
    };
  }, [
    config.invigilateEnable,
    handleSocketMessage,
    profile?.id,
    session.examId,
    session.userExamId,
    userLeave,
  ]);

  if (!config.snapOn && !config.invigilateEnable) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MonitorUp className="size-4 text-sky-600" />
            在线监考
          </div>
          <p className="mt-1 text-xs text-slate-500">
            摄像头抓拍与监考大屏连接已按考试配置启用。
          </p>
        </div>
        {socketError ? (
          <WifiOff className="size-4 text-amber-500" />
        ) : (
          <Camera className="size-4 text-emerald-600" />
        )}
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="mt-3 aspect-video w-full rounded-2xl bg-slate-950 object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {(cameraError || socketError || invigilateMessage) && (
        <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {invigilateMessage ?? cameraError ?? socketError}
        </div>
      )}
    </section>
  );
});

OnlineInvigilateSnap.displayName = "OnlineInvigilateSnap";

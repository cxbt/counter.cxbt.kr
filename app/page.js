"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Checkbox,
  ColorPicker,
  ConfigProvider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  TimePicker,
  theme as antdTheme,
} from "antd";
import {
  CaretRightFilled,
  CloseOutlined,
  DeleteOutlined,
  PauseOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const STORAGE_KEY = "custom-timer-settings-v2";
const PULSE_MS = 2200;
const SETTINGS_NOTE_FADE_DELAY_MS = 2200;
const SETTINGS_NOTE_HIDE_DELAY_MS = 2800;

const DEFAULT_SETTINGS = {
  duration: { hours: 0, minutes: 30, seconds: 0 },
  milestones: [
    { timeSeconds: 300, label: "5분" },
    { timeSeconds: 600, label: "10분" },
    { timeSeconds: 900, label: "15분" },
  ],
  barColor: "#42cf82",
  mode: "dark",
  showMilliseconds: false,
  showMilestoneTrack: true,
  timerScale: 100,
  trackHeight: 64,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex.toLowerCase() : DEFAULT_SETTINGS.barColor;
}

function durationPartsToSeconds(duration) {
  const hours = clamp(Number(duration.hours) || 0, 0, 23);
  const minutes = clamp(Number(duration.minutes) || 0, 0, 59);
  const seconds = clamp(Number(duration.seconds) || 0, 0, 59);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : 30 * 60;
}

function secondsToDurationParts(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return {
    hours: Math.floor(safe / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
}

function secondsToDayjs(totalSeconds) {
  const parts = secondsToDurationParts(totalSeconds);
  return dayjs()
    .hour(parts.hours)
    .minute(parts.minutes)
    .second(parts.seconds)
    .millisecond(0);
}

function dayjsToSeconds(value) {
  if (!value || typeof value.hour !== "function") {
    return 0;
  }

  return value.hour() * 3600 + value.minute() * 60 + value.second();
}

function getTimeDisplayParts(totalMs) {
  const safeMs = Math.max(0, totalMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutesRemainder = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((safeMs % 1000) / 10);

  return {
    hasHours: hours > 0,
    hours: String(hours).padStart(2, "0"),
    minutes: String(hours > 0 ? minutesRemainder : Math.floor(totalSeconds / 60)).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    centiseconds: String(centiseconds).padStart(2, "0"),
  };
}

function formatTime(totalMs, showMilliseconds) {
  const parts = getTimeDisplayParts(totalMs);
  const base =
    parts.hasHours
      ? `${parts.hours}:${parts.minutes}:${parts.seconds}`
      : `${parts.minutes}:${parts.seconds}`;

  return showMilliseconds ? `${base}.${parts.centiseconds}` : base;
}

function formatDuration(seconds) {
  const parts = secondsToDurationParts(seconds);
  if (parts.hours > 0) {
    return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}:${String(parts.seconds).padStart(2, "0")}`;
  }

  return `${String(parts.minutes).padStart(2, "0")}:${String(parts.seconds).padStart(2, "0")}`;
}

function formatMilestoneTime(seconds) {
  const parts = secondsToDurationParts(seconds);
  return `${String(parts.hours).padStart(2, "0")}:${String(parts.minutes).padStart(2, "0")}:${String(parts.seconds).padStart(2, "0")}`;
}

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(baseHex, targetHex, weight) {
  const base = hexToRgb(baseHex);
  const target = hexToRgb(targetHex);
  return rgbToHex({
    r: base.r + (target.r - base.r) * weight,
    g: base.g + (target.g - base.g) * weight,
    b: base.b + (target.b - base.b) * weight,
  });
}

function rgbaFromHex(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function sanitizeSettings(candidate) {
  const duration = candidate?.duration || DEFAULT_SETTINGS.duration;
  const totalDurationSeconds = durationPartsToSeconds(duration);
  const barColor = normalizeHex(candidate?.barColor || DEFAULT_SETTINGS.barColor);
  const mode = candidate?.mode === "light" ? "light" : "dark";
  const showMilliseconds = Boolean(candidate?.showMilliseconds);
  const showMilestoneTrack = candidate?.showMilestoneTrack !== false;
  const timerScaleNumber = Number(candidate?.timerScale);
  const trackHeightNumber = Number(candidate?.trackHeight);
  const timerScale = Number.isFinite(timerScaleNumber) ? Math.round(timerScaleNumber) : DEFAULT_SETTINGS.timerScale;
  const trackHeight = Number.isFinite(trackHeightNumber) ? Math.round(trackHeightNumber) : DEFAULT_SETTINGS.trackHeight;

  const milestones = Array.isArray(candidate?.milestones)
    ? candidate.milestones
        .map((item) => ({
          timeSeconds: Math.floor(Number(item?.timeSeconds) || 0),
          label: String(item?.label || "").trim(),
        }))
        .filter((item) => item.timeSeconds > 0 && item.timeSeconds <= totalDurationSeconds)
        .sort((left, right) => left.timeSeconds - right.timeSeconds)
    : DEFAULT_SETTINGS.milestones;

  return {
    duration: secondsToDurationParts(totalDurationSeconds),
    milestones,
    barColor,
    mode,
    showMilliseconds,
    showMilestoneTrack,
    timerScale,
    trackHeight,
  };
}

function settingsToFormValues(settings) {
  return {
    durationTime: secondsToDayjs(durationPartsToSeconds(settings.duration)),
    showMilliseconds: settings.showMilliseconds,
    showMilestoneTrack: settings.showMilestoneTrack,
    timerScale: settings.timerScale,
    trackHeight: settings.trackHeight,
    barColor: settings.barColor,
    mode: settings.mode,
    milestones: settings.milestones.map((item) => ({
      time: secondsToDayjs(item.timeSeconds),
      label: item.label,
    })),
  };
}

function formValuesToSettings(values) {
  const totalDurationSeconds = Math.max(1, dayjsToSeconds(values.durationTime));

  const milestones = Array.isArray(values.milestones)
    ? values.milestones
        .map((item) => ({
          timeSeconds: dayjsToSeconds(item?.time),
          label: String(item?.label || "").trim(),
        }))
        .filter((item) => item.timeSeconds > 0 && item.timeSeconds <= totalDurationSeconds)
        .sort((left, right) => left.timeSeconds - right.timeSeconds)
    : [];

  return sanitizeSettings({
    duration: secondsToDurationParts(totalDurationSeconds),
    milestones,
    barColor:
      typeof values.barColor?.toHexString === "function"
        ? values.barColor.toHexString()
        : values.barColor,
    mode: values.mode,
    showMilliseconds: values.showMilliseconds,
    showMilestoneTrack: values.showMilestoneTrack,
    timerScale: values.timerScale,
    trackHeight: values.trackHeight,
  });
}

export default function Page() {
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [remainingMs, setRemainingMs] = useState(durationPartsToSeconds(DEFAULT_SETTINGS.duration) * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const [settingsNote, setSettingsNote] = useState("");
  const [isSettingsNoteVisible, setIsSettingsNoteVisible] = useState(false);
  const [isSettingsNoteFading, setIsSettingsNoteFading] = useState(false);
  const frameRef = useRef(null);
  const startedAtRef = useRef(null);
  const pulseTimeoutRef = useRef(null);
  const settingsNoteFadeTimeoutRef = useRef(null);
  const settingsNoteHideTimeoutRef = useRef(null);
  const prevReachedIndexRef = useRef(-1);

  function clearSettingsNoteTimers() {
    window.clearTimeout(settingsNoteFadeTimeoutRef.current);
    window.clearTimeout(settingsNoteHideTimeoutRef.current);
  }

  function showSettingsNote(message) {
    clearSettingsNoteTimers();
    setSettingsNote(message);
    setIsSettingsNoteVisible(true);
    setIsSettingsNoteFading(false);
    settingsNoteFadeTimeoutRef.current = window.setTimeout(() => {
      setIsSettingsNoteFading(true);
    }, SETTINGS_NOTE_FADE_DELAY_MS);
    settingsNoteHideTimeoutRef.current = window.setTimeout(() => {
      setIsSettingsNoteVisible(false);
      setIsSettingsNoteFading(false);
    }, SETTINGS_NOTE_HIDE_DELAY_MS);
  }

  const totalDurationSeconds = useMemo(() => durationPartsToSeconds(settings.duration), [settings.duration]);
  const totalDurationMs = totalDurationSeconds * 1000;
  const elapsedMs = Math.max(0, totalDurationMs - remainingMs);
  const progress = totalDurationMs > 0 ? remainingMs / totalDurationMs : 1;

  const reachedMilestoneIndex = useMemo(() => {
    let index = -1;
    settings.milestones.forEach((milestone, milestoneIndex) => {
      if (elapsedMs >= milestone.timeSeconds * 1000) {
        index = milestoneIndex;
      }
    });
    return index;
  }, [elapsedMs, settings.milestones]);

  const nextMilestoneIndex = useMemo(
    () => settings.milestones.findIndex((milestone) => elapsedMs < milestone.timeSeconds * 1000),
    [elapsedMs, settings.milestones]
  );

  const nextMilestone = nextMilestoneIndex >= 0 ? settings.milestones[nextMilestoneIndex] : null;
  const milestoneTitle = nextMilestone?.label?.trim() || "";

  const barPalette = useMemo(() => {
    const main = normalizeHex(settings.barColor);
    return {
      main,
      warn: mixHex(main, "#ffcc66", 0.45),
      end: mixHex(main, "#ff5e5b", 0.65),
      chipActive: rgbaFromHex(main, settings.mode === "dark" ? 0.18 : 0.24),
      chipDone: rgbaFromHex(mixHex(main, "#ffcc66", 0.45), settings.mode === "dark" ? 0.2 : 0.18),
    };
  }, [settings.barColor, settings.mode]);

  useEffect(() => {
    setMounted(true);

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? sanitizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
      setSettings(parsed);
      setRemainingMs(durationPartsToSeconds(parsed.duration) * 1000);
    } catch {
      showSettingsNote("저장된 설정을 읽지 못함");
    }
  }, []);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    form.setFieldsValue(settingsToFormValues(settings));
  }, [drawerOpen, form]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.body.dataset.mode = settings.mode;
    document.documentElement.style.setProperty("--fill-main", barPalette.main);
    document.documentElement.style.setProperty("--fill-warn", barPalette.warn);
    document.documentElement.style.setProperty("--fill-end", barPalette.end);
    document.documentElement.style.setProperty("--chip-active", barPalette.chipActive);
    document.documentElement.style.setProperty("--chip-done", barPalette.chipDone);
  }, [barPalette, mounted, settings.mode]);

  useEffect(() => {
    setRemainingMs(totalDurationMs);
    setIsRunning(false);
    startedAtRef.current = null;
    prevReachedIndexRef.current = -1;
    setPulseActive(false);
  }, [totalDurationMs]);

  useEffect(() => {
    if (!isRunning) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return undefined;
    }

    const tick = (now) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = now - (totalDurationMs - remainingMs);
      }

      const elapsed = now - startedAtRef.current;
      const nextRemaining = Math.max(0, totalDurationMs - elapsed);
      setRemainingMs(nextRemaining);

      if (nextRemaining > 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      setIsRunning(false);
      startedAtRef.current = null;
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isRunning, remainingMs, totalDurationMs]);

  useEffect(() => {
    if (!isRunning || reachedMilestoneIndex <= prevReachedIndexRef.current) {
      prevReachedIndexRef.current = reachedMilestoneIndex;
      return;
    }

    prevReachedIndexRef.current = reachedMilestoneIndex;
    setPulseActive(true);
    window.clearTimeout(pulseTimeoutRef.current);
    pulseTimeoutRef.current = window.setTimeout(() => {
      setPulseActive(false);
    }, PULSE_MS);
  }, [isRunning, reachedMilestoneIndex]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (pulseTimeoutRef.current) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
      clearSettingsNoteTimers();
    };
  }, []);

  const formattedTime = formatTime(remainingMs, settings.showMilliseconds);
  const isFinished = remainingMs <= 0;
  const timeDisplay = isFinished ? "😄👍" : formattedTime;

  function handleToggleTimer() {
    if (isFinished) {
      return;
    }

    if (isRunning) {
      setIsRunning(false);
      startedAtRef.current = null;
      return;
    }

    setIsRunning(true);
  }

  function handleReset() {
    setIsRunning(false);
    setRemainingMs(totalDurationMs);
    startedAtRef.current = null;
    prevReachedIndexRef.current = -1;
    setPulseActive(false);
  }

  function handleApply(values) {
    const nextSettings = formValuesToSettings(values);
    setSettings(nextSettings);
    form.setFieldsValue(settingsToFormValues(nextSettings));
    showSettingsNote("저장되었습니다!");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
  }

  const algorithm = settings.mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

  return (
    <ConfigProvider
      theme={{
        algorithm,
        token: {
          colorPrimary: barPalette.main,
          borderRadius: 8,
          fontFamily: 'Inter, "Apple SD Gothic Neo", "Noto Sans KR", system-ui, sans-serif',
        },
      }}
    >
      <div className="timer-app">
        <main className="timer-shell">
          <section className="timer-stage" aria-label="타이머">
            <h1
              className="timer-time"
              style={{ "--timer-scale": `${settings.timerScale / 100}` }}
              aria-label={timeDisplay}
            >
              {timeDisplay}
            </h1>
            {milestoneTitle ? <p className="timer-state">{milestoneTitle}</p> : null}
            {settings.showMilestoneTrack ? (
              <div
                className="milestone-track"
                style={{
                  "--track-progress": Math.max(0, Math.min(1, progress)),
                  "--track-height": `${settings.trackHeight}px`,
                }}
              >
                {settings.milestones.map((milestone, index) => {
                  const isReached = index <= reachedMilestoneIndex;
                  const isNext = index === nextMilestoneIndex;
                  const markerTime = formatMilestoneTime(milestone.timeSeconds);
                  const markerName = milestone.label?.trim() || "마일스톤";
                  return (
                    <span
                      key={`${milestone.timeSeconds}-${milestone.label}`}
                      className={`milestone-marker${isReached ? " is-reached" : ""}${isNext ? " is-next" : ""}`}
                      style={{ left: `${(milestone.timeSeconds / totalDurationSeconds) * 100}%` }}
                      data-label={markerTime}
                    >
                      <span className="milestone-marker-name">{markerName}</span>
                    </span>
                  );
                })}
              </div>
            ) : null}
            <Space size={10} wrap className="timer-actions">
              <Button
                type="primary"
                size="large"
                shape="circle"
                icon={isRunning ? <PauseOutlined className="timer-playback-icon" /> : <CaretRightFilled className="timer-playback-icon" />}
                aria-label={isRunning ? "일시정지" : "시작"}
                className="timer-action-button"
                disabled={isFinished}
                onClick={handleToggleTimer}
              />
              <Button
                size="large"
                shape="circle"
                icon={<ReloadOutlined />}
                aria-label="리셋"
                className="timer-action-button"
                onClick={handleReset}
              />
              <Button
                size="large"
                shape="circle"
                icon={<SettingOutlined />}
                aria-label="설정"
                className="timer-action-button"
                onClick={() => setDrawerOpen(true)}
              />
            </Space>
          </section>
        </main>

        <Drawer
          title="설정"
          closable={false}
          extra={
            <Button type="text" aria-label="닫기" onClick={() => {
              setDrawerOpen(false);
            }} icon={<CloseOutlined />} />
          }
          placement="right"
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
          }}
          size={380}
          destroyOnHidden={false}
        >
          <Form form={form} layout="vertical" onFinish={handleApply} initialValues={settingsToFormValues(settings)}>
            <p className="settings-section-title">카운터 설정</p>
            <div className="settings-row settings-row-2-1 settings-row-counter">
              <Form.Item label="총 시간" name="durationTime" className="settings-item">
                <TimePicker format="HH:mm:ss" allowClear={false} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="showMilliseconds" valuePropName="checked" className="settings-item settings-item-checkbox">
                <Checkbox>ms 표시</Checkbox>
              </Form.Item>
            </div>

            <Form.List name="milestones">
              {(fields, { add, remove }) => (
                <div className="milestone-form-list">
                  <div className="milestone-form-header">
                    <span>마일스톤</span>
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        const formDurationSeconds = dayjsToSeconds(form.getFieldValue("durationTime"));
                        const baseDurationSeconds = Math.max(1, formDurationSeconds || totalDurationSeconds);
                        const nextTimeSeconds = Math.min(5 * 60, baseDurationSeconds);
                        add({ time: secondsToDayjs(nextTimeSeconds), label: "" });
                      }}
                    >
                      추가
                    </Button>
                  </div>

                  {fields.length === 0 ? <p className="milestone-form-empty">마일스톤이 없습니다</p> : null}

                  {fields.map((field) => {
                    const { key, ...restField } = field;
                    return (
                      <div key={key} className="milestone-form-row">
                        <Form.Item {...restField} name={[field.name, "time"]} className="milestone-form-time">
                          <TimePicker format="HH:mm:ss" allowClear={false} />
                        </Form.Item>
                        <Form.Item {...restField} name={[field.name, "label"]} className="milestone-form-label">
                          <Input placeholder="목표 이름" />
                        </Form.Item>
                        <Button danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Form.List>

            <Form.Item name="showMilestoneTrack" valuePropName="checked" className="settings-item settings-item-checkbox">
              <Checkbox>카운터 바 표시</Checkbox>
            </Form.Item>

            <p className="settings-section-title settings-section-title-divider">스타일 설정</p>
            <div className="settings-row settings-row-1-1">
              <Form.Item label="타이머 글자 크기(%)" name="timerScale" className="settings-item">
                <InputNumber step={5} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="마일스톤 바 높이(px)" name="trackHeight" className="settings-item">
                <InputNumber step={2} style={{ width: "100%" }} />
              </Form.Item>
            </div>

            <div className="settings-row settings-row-1-2">
              <Form.Item label="Bar 색상" name="barColor" className="settings-item">
                <ColorPicker format="hex" showText />
              </Form.Item>

              <Form.Item label="모드" name="mode" className="settings-item">
                <Select
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                  ]}
                />
              </Form.Item>
            </div>

            <Button type="primary" htmlType="submit" block size="large">
              저장
            </Button>

            {isSettingsNoteVisible ? (
              <p className={`settings-note${isSettingsNoteFading ? " is-fading" : ""}`}>{settingsNote}</p>
            ) : null}
          </Form>
        </Drawer>
      </div>
    </ConfigProvider>
  );
}

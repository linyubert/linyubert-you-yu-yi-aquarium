"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Student = {
  id: string;
  name: string;
  feeds: number;
  hue: number;
  lane: number;
};

type Classroom = {
  id: string;
  name: string;
  sceneId: "forest" | "coral" | "moon";
  scene: string;
  motto: string;
};

type SwimSpeed = "slow" | "normal" | "fast";

const swimSpeedMultipliers: Record<SwimSpeed, number> = {
  slow: 0.65,
  normal: 1,
  fast: 1.5,
};

const defaultClassrooms: Classroom[] = [
  { id: "forest", name: "星海班", sceneId: "forest", scene: "海藻森林", motto: "向著光，穩穩長大" },
  { id: "coral", name: "珊瑚班", sceneId: "coral", scene: "晨光珊瑚礁", motto: "彼此照亮，繽紛共學" },
  { id: "moon", name: "鯨語班", sceneId: "moon", scene: "月光深海", motto: "安靜蓄力，勇敢發光" },
];

const scenes = {
  forest: { name: "海藻森林", motto: "向著光，穩穩長大" },
  coral: { name: "晨光珊瑚礁", motto: "彼此照亮，繽紛共學" },
  moon: { name: "月光深海", motto: "安靜蓄力，勇敢發光" },
} as const;

const demoNames = ["林以安", "陳品妍", "王昀澤", "吳若晴", "李承翰", "張語恩"];

function seedStudent(name: string, index: number): Student {
  const clean = name.trim();
  return {
    id: `${Date.now()}-${index}-${clean}`,
    name: clean,
    feeds: 0,
    hue: (index * 57 + 8) % 360,
    lane: index % 7,
  };
}

function parseNames(text: string) {
  const rows = text
    .replace(/\r/g, "")
    .split(/\n|、|;/)
    .map((row) => row.split(/,|\t/)[0]?.trim())
    .filter(Boolean) as string[];
  const header = rows[0]?.toLowerCase();
  return [...new Set(["姓名", "name", "student", "學生姓名"].includes(header) ? rows.slice(1) : rows)];
}

function studentSeed(student: Student) {
  return [...`${student.id}-${student.name}`]
    .reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function Fish({ student, onFeed, isFed, speed }: { student: Student; onFeed: () => void; isFed: boolean; speed: number }) {
  const scale = Math.min(2.6, 0.72 + student.feeds * 0.095);
  const motionSeed = studentSeed(student);
  const variant = motionSeed % 10;
  const startsFromRight = motionSeed % 2 === 1;
  const drift = (shift: number, range: number, offset: number) =>
    ((motionSeed >>> shift) % range) + offset;
  const style = {
    "--hue": `${student.hue}`,
    "--lane": `${student.lane}`,
    "--scale": `${scale}`,
    "--start-facing": startsFromRight ? "-1" : "1",
    "--return-facing": startsFromRight ? "1" : "-1",
    "--start-x": startsFromRight ? "calc(100% + 30px)" : "-180px",
    "--far-x": startsFromRight ? "-180px" : "calc(100% + 30px)",
    "--drift-a": `${drift(2, 71, -35)}px`,
    "--drift-b": `${drift(9, 91, -45)}px`,
    "--drift-c": `${drift(16, 61, -30)}px`,
    "--duration": `${drift(5, 17, 24) / speed}s`,
    "--delay": `${-drift(12, 29, 0)}s`,
  } as React.CSSProperties;

  return (
    <button
      className={`fishSwimmer fishVariant${variant} ${isFed ? "justFed" : ""}`}
      style={style}
      onClick={onFeed}
      aria-label={`餵食 ${student.name}，目前 ${student.feeds} 顆星`}
      title={`餵食 ${student.name}`}
    >
      <span className="fishName">{student.name}</span>
      <span className="fishFacing">
        <span className="fishShape">
          <span className="tail" />
          <span className="fin finTop" />
          <span className="fin finSide" />
          <span className="fishBody"><i /></span>
        </span>
      </span>
      <span className="feedPop">+1</span>
    </button>
  );
}

export default function Home() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(defaultClassrooms);
  const [rosters, setRosters] = useState<Record<string, Student[]>>({ forest: [], coral: [], moon: [] });
  const [activeClass, setActiveClass] = useState("forest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fedId, setFedId] = useState<string | null>(null);
  const [batchCelebrating, setBatchCelebrating] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [className, setClassName] = useState("");
  const [classScene, setClassScene] = useState<keyof typeof scenes>("forest");
  const [classMotto, setClassMotto] = useState(scenes.forest.motto);
  const [pastedNames, setPastedNames] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [swimSpeed, setSwimSpeed] = useState<SwimSpeed>("normal");
  const fileRef = useRef<HTMLInputElement>(null);
  const aquariumRef = useRef<HTMLDivElement>(null);
  const students = rosters[activeClass] ?? [];
  const classroom = classrooms.find((item) => item.id === activeClass) ?? classrooms[0] ?? defaultClassrooms[0];

  useEffect(() => {
    const savedClasses = localStorage.getItem("youyuyi-classrooms");
    const savedClassDefs = localStorage.getItem("youyuyi-class-defs");
    const savedSwimSpeed = localStorage.getItem("youyuyi-swim-speed") as SwimSpeed | null;
    const legacy = localStorage.getItem("youyuyi-students");
    try {
      if (savedClassDefs) setClassrooms(JSON.parse(savedClassDefs));
      if (savedClasses) setRosters(JSON.parse(savedClasses));
      else if (legacy) setRosters({ forest: JSON.parse(legacy), coral: [], moon: [] });
      if (savedSwimSpeed && savedSwimSpeed in swimSpeedMultipliers) setSwimSpeed(savedSwimSpeed);
    } catch { /* keep empty tanks */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("youyuyi-classrooms", JSON.stringify(rosters));
  }, [rosters]);

  useEffect(() => {
    localStorage.setItem("youyuyi-class-defs", JSON.stringify(classrooms));
  }, [classrooms]);

  const updateStudents = (updater: (current: Student[]) => Student[]) => {
    setRosters((current) => ({ ...current, [activeClass]: updater(current[activeClass] ?? []) }));
  };

  const updateSwimSpeed = (speed: SwimSpeed) => {
    setSwimSpeed(speed);
    localStorage.setItem("youyuyi-swim-speed", speed);
  };

  const playFeed = () => {
    if (!soundOn) return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  };

  const feed = (id: string) => {
    updateStudents((list) => list.map((student) => student.id === id ? { ...student, feeds: student.feeds + 1 } : student));
    setSelectedId(id);
    setFedId(id);
    playFeed();
    window.setTimeout(() => setFedId((current) => current === id ? null : current), 700);
  };

  const feedClass = () => {
    if (!students.length) return;
    updateStudents((list) => list.map((student) => ({ ...student, feeds: student.feeds + 1 })));
    setSelectedId(null);
    setBatchCelebrating(true);
    playFeed();
    window.setTimeout(() => setBatchCelebrating(false), 700);
  };

  const deduct = (id: string) => {
    updateStudents((list) => list.map((student) => student.id === id ? { ...student, feeds: Math.max(0, student.feeds - 1) } : student));
    setSelectedId(id);
  };

  const resetClass = () => {
    if (!students.some((student) => student.feeds > 0)) return;
    if (window.confirm(`確定要將「${classroom.name}」所有學生的成長值歸零嗎？`)) {
      updateStudents((list) => list.map((student) => ({ ...student, feeds: 0 })));
      setSelectedId(null);
    }
  };

  const importRoster = (names: string[]) => {
    if (!names.length) return;
    updateStudents(() => names.map(seedStudent));
    setSelectedId(null);
    setShowImport(false);
    setPastedNames("");
  };

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    importRoster(parseNames(await file.text()));
    event.target.value = "";
  };

  const ranked = useMemo(
    () => [...students].sort((a, b) => b.feeds - a.feeds || a.name.localeCompare(b.name, "zh-Hant")),
    [students],
  );
  const selected = students.find((student) => student.id === selectedId);
  const totalFeeds = students.reduce((sum, student) => sum + student.feeds, 0);
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) await aquariumRef.current?.requestFullscreen();
    else await document.exitFullscreen();
  };

  const switchClass = (id: string) => {
    setActiveClass(id);
    setSelectedId(null);
  };

  const openClassEditor = (item?: Classroom) => {
    setEditingClassId(item?.id ?? null);
    setClassName(item?.name ?? "");
    setClassScene(item?.sceneId ?? "forest");
    setClassMotto(item?.motto ?? scenes.forest.motto);
    setShowClassModal(true);
  };

  const saveClass = () => {
    const name = className.trim();
    if (!name) return;
    const scene = scenes[classScene];
    if (editingClassId) {
      setClassrooms((list) => list.map((item) => item.id === editingClassId
        ? { ...item, name, sceneId: classScene, scene: scene.name, motto: classMotto.trim() || scene.motto }
        : item));
    } else {
      const id = `class-${Date.now()}`;
      setClassrooms((list) => [...list, { id, name, sceneId: classScene, scene: scene.name, motto: classMotto.trim() || scene.motto }]);
      setRosters((current) => ({ ...current, [id]: [] }));
      setActiveClass(id);
    }
    setShowClassModal(false);
  };

  return (
    <main className="aquariumApp">
      <header className="siteHeader">
        <button className="brandLockup" onClick={() => setSelectedId(null)} aria-label="游於藝首頁">
          <span className="seal">游</span>
          <span><b>游於藝</b><small>YÓU YÚ YÌ · 學習成就水族館</small></span>
        </button>
        <div className="headerActions">
          <span className="liveDot"><i /> 水族館運作中</span>
          <button className="iconButton" onClick={() => setSoundOn(!soundOn)} aria-label={soundOn ? "關閉音效" : "開啟音效"}>
            {soundOn ? "♪" : "×"}
          </button>
          <button className="importButton" onClick={() => setShowImport(true)}>＋ 匯入名冊</button>
        </div>
      </header>

      <section className="intro">
        <div>
          <span className="eyebrow">CLASS AQUARIUM · 2026</span>
          <h1>每一次努力，<br />都讓成長<span>清晰可見。</span></h1>
        </div>
        <p>每位學生，都是水中獨一無二的風景。<br />餵下一顆星，看見他們自在茁壯。</p>
      </section>

      <nav className="classTabs" aria-label="切換班級水族箱">
        <div className="classTabScroller">{classrooms.map((item, index) => (
          <button className={item.id === activeClass ? "active" : ""} key={item.id} onClick={() => switchClass(item.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <b>{item.name}</b>
            <small>{item.scene} · {rosters[item.id]?.length ?? 0} 人</small>
          </button>
        ))}</div>
        <button className="addClassButton" onClick={() => openClassEditor()}><span>＋</span><b>新增班級</b><small>自訂名稱與情境</small></button>
      </nav>

      <section className="dashboard">
        <div className="tankColumn">
          <div className="tankTop">
            <div><span>{classroom.name} · {classroom.scene}</span><b>{students.length ? `${students.length} 位游藝家` : "等待游藝家加入"}</b></div>
            <div className="tankStats">
              <span>今日餵食 <b>{totalFeeds}</b></span>
              <span>水質 <b>優良</b></span>
              <label className="fishSpeedControl">
                <span>游速</span>
                <select value={swimSpeed} onChange={(event) => updateSwimSpeed(event.target.value as SwimSpeed)} aria-label="設定魚群游速">
                  <option value="slow">慢速</option>
                  <option value="normal">標準</option>
                  <option value="fast">快速</option>
                </select>
              </label>
              <button className="bulkFeedButton" disabled={!students.length} onClick={feedClass} aria-label={`全班 ${students.length} 位學生各加一顆星`}>★ 全班＋1</button>
              <button className="settingsButton" onClick={() => openClassEditor(classroom)}>⚙ 班級設定</button>
              <button onClick={toggleFullscreen}>⛶ 全螢幕</button>
            </div>
          </div>

          <div ref={aquariumRef} className={`aquarium scene-${classroom.sceneId}`} aria-label={`${classroom.name}${classroom.scene}互動學生水族箱`}>
            <div className="waterGlow" />
            <div className="caustics" />
            <div className="sceneMoon" />
            <div className="coralGarden"><i /><i /><i /><i /><i /></div>
            <div className="jellyfish jelly1"><i /></div><div className="jellyfish jelly2"><i /></div>
            <div className="sceneTitle"><small>{classroom.scene}</small><b>{classroom.motto}</b></div>
            <div className="bubble b1" /><div className="bubble b2" /><div className="bubble b3" /><div className="bubble b4" />
            <div className="plant plant1"><i /><i /><i /><i /></div>
            <div className="plant plant2"><i /><i /><i /></div>
            <div className="plant plant3"><i /><i /><i /><i /></div>
            <div className="rock rock1" /><div className="rock rock2" />
            {students.map((student) => <Fish key={student.id} student={student} speed={swimSpeedMultipliers[swimSpeed]} onFeed={() => feed(student.id)} isFed={fedId === student.id || batchCelebrating} />)}
            {!students.length && (
              <div className="emptyTank">
                <span className="emptyOrb">游</span>
                <h2>{classroom.name}正等待第一尾魚</h2>
                <p>匯入班級名冊，每位學生都會化為一尾獨特的魚。</p>
                <div>
                  <button onClick={() => setShowImport(true)}>匯入學生名冊</button>
                  <button onClick={() => importRoster(demoNames)}>觀看示範</button>
                </div>
              </div>
            )}
            {selected && <div className="selectedCard"><small>正在觀察</small><b>{selected.name}</b><span>已獲得 {selected.feeds} 次餵食</span></div>}
            <div className="sand"><i /><i /><i /><i /><i /></div>
            <div className="tankHint">點一下魚，就能餵食</div>
          </div>
        </div>

        <aside className="leaderboard">
          <div className="boardHead">
            <div><small>{classroom.name.toUpperCase()} · GROWTH BOARD</small><h2>游藝英雄榜</h2></div>
            <span>{students.length} 人</span>
          </div>
          <div className="rankLabels"><span>排名 / 游藝家</span><span>成長值</span></div>
          <div className="studentList">
            {ranked.length ? ranked.map((student, index) => (
              <article className={`studentRow ${selectedId === student.id ? "active" : ""}`} key={student.id} onClick={() => setSelectedId(student.id)}>
                <span className={`rank rank${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
                <span className="miniFish" style={{ "--hue": student.hue } as React.CSSProperties}>●</span>
                <span className="studentName"><b>{student.name}</b><small>LV. {Math.floor(student.feeds / 5) + 1} · {student.feeds} 顆星</small></span>
                <span className="scoreActions">
                  <button className="deductButton" disabled={student.feeds === 0} onClick={(event) => { event.stopPropagation(); deduct(student.id); }} aria-label={`扣除 ${student.name} 一顆星`}>−</button>
                  <button onClick={(event) => { event.stopPropagation(); feed(student.id); }} aria-label={`餵食 ${student.name}`}>餵食 <i>＋</i></button>
                </span>
              </article>
            )) : (
              <div className="emptyList"><span>◌</span><p>匯入名冊後，<br />成長紀錄會出現在這裡。</p></div>
            )}
          </div>
          <div className="boardFoot">
            <span><i /> 每餵食一次，魚會長大一點</span>
            {students.length > 0 && <span className="boardTools"><button onClick={resetClass}>重置分數</button><button onClick={() => setShowImport(true)}>管理名冊</button></span>}
          </div>
        </aside>
      </section>

      <footer><span>游於藝 · 讓成長被看見</span><span>水族箱資料儲存於此裝置</span></footer>

      {showImport && (
        <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowImport(false)}>
          <section className="importModal" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <button className="closeButton" onClick={() => setShowImport(false)} aria-label="關閉">×</button>
            <span className="modalKicker">ADD NEW SWIMMERS</span>
            <h2 id="import-title">匯入學生名冊</h2>
            <p>可上傳 CSV 或 TXT，系統會讀取第一欄姓名；也可以直接在下方貼上名單。</p>
            <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={readFile} />
            <button className="uploadZone" onClick={() => fileRef.current?.click()}>
              <span>↑</span><b>選擇名冊檔案</b><small>CSV / TXT · 第一欄為學生姓名</small>
            </button>
            <div className="or"><span>或直接貼上</span></div>
            <textarea value={pastedNames} onChange={(event) => setPastedNames(event.target.value)} placeholder={"林以安\n陳品妍\n王昀澤"} />
            <div className="modalActions">
              <button onClick={() => setShowImport(false)}>取消</button>
              <button disabled={!parseNames(pastedNames).length} onClick={() => importRoster(parseNames(pastedNames))}>建立魚群 →</button>
            </div>
          </section>
        </div>
      )}

      {showClassModal && (
        <div className="modalBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowClassModal(false)}>
          <section className="importModal classModal" role="dialog" aria-modal="true" aria-labelledby="class-title">
            <button className="closeButton" onClick={() => setShowClassModal(false)} aria-label="關閉">×</button>
            <span className="modalKicker">CLASS AQUARIUM</span>
            <h2 id="class-title">{editingClassId ? "自訂班級" : "新增班級"}</h2>
            <label className="fieldLabel">班級名稱<input value={className} maxLength={16} onChange={(event) => setClassName(event.target.value)} placeholder="例如：海豚班" /></label>
            <fieldset className="sceneChoices">
              <legend>選擇水族情境</legend>
              {(Object.keys(scenes) as Array<keyof typeof scenes>).map((id) => (
                <button type="button" className={classScene === id ? "active" : ""} key={id} onClick={() => { setClassScene(id); setClassMotto(scenes[id].motto); }}>
                  <span className={`sceneSwatch ${id}`} /><b>{scenes[id].name}</b>
                </button>
              ))}
            </fieldset>
            <label className="fieldLabel">班級標語<input value={classMotto} maxLength={24} onChange={(event) => setClassMotto(event.target.value)} /></label>
            <div className="modalActions">
              <button onClick={() => setShowClassModal(false)}>取消</button>
              <button disabled={!className.trim()} onClick={saveClass}>{editingClassId ? "儲存設定" : "建立水族箱"} →</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

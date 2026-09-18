const modules = {
  ego: {
    number: "MODULE 01",
    name: "Ego 视觉输入",
    summary: "从佩戴者第一人称视角持续捕获“我在看什么、手在做什么、机械手在哪里”。",
    question: "动态遮挡、视野抖动与尺度变化下，如何稳定表征手—物—机械手关系？",
    method: "Ego 时序编码、多视角注意力、手部关键点/物体分割、视觉基础模型特征。",
    io: "Ego / 桌面 / 腕部 RGB → 时空视觉 token、手物关系图、置信度。",
    innovation: "把第一人称视角建模为“行动者视角”，强调可供性与下一步动作线索，而非单帧识别。"
  },
  state: {
    number: "MODULE 02",
    name: "人机状态",
    summary: "把人的身体能力、健患侧运动和机器人状态放进统一的动态观测。",
    question: "如何同时描述人的动作能力、机械系统状态与二者接触关系？",
    method: "q / q̇ / 力矩 / 交互力 / ROM 融合，人体运动学先验，时序状态估计。",
    io: "本体、力觉、ROM、手部轨迹 → 人机联合状态 sₜ 与风险量。",
    innovation: "以患者实时能力而非固定动作模板作为策略条件，使同一任务适配不同个体与恢复阶段。"
  },
  align: {
    number: "MODULE 03",
    name: "跨视角对齐",
    summary: "将 Ego、桌面与腕部相机中的同一只手、物体和目标映射到共同任务空间。",
    question: "仅依赖 Ego 为主的观测，如何在运动相机与遮挡中保持目标一致性？",
    method: "时序注意力、语义对应、SLAM / 深度先验、手眼标定与不确定性传播。",
    io: "多视角特征 + 相机/机器人位姿 → 统一语义—几何表示与目标位姿。",
    innovation: "让语义目标与几何约束共同对齐，并显式输出不确定性供安全层使用。"
  },
  intent: {
    number: "MODULE 04",
    name: "意图理解",
    summary: "从语言、注视、健侧手动作与任务进度中推断“要做什么、做到哪一步”。",
    question: "怎样区分动作尝试、示范、求助与中止，并提前识别意图转折？",
    method: "语言—视觉—状态联合编码，层级任务分解，动作阶段识别与短时目标预测。",
    io: "视觉 token + 语言任务 + 联合状态 → 意图类别、子任务、目标与置信度。",
    innovation: "把健侧动作视为对患侧协作的在线条件，实现示范—辅助之间的动态映射。"
  },
  policy: {
    number: "MODULE 05",
    name: "协作策略",
    summary: "决定人和机器此刻各自做什么，以及辅助程度如何随动作阶段改变。",
    question: "如何在完成任务、尊重人的主动性与保证安全之间实时权衡？",
    method: "分层 VLA / LBM、模仿学习、角色分配、共享自主、约束策略优化。",
    io: "意图 + 对齐表征 + 状态 + 安全约束 → 人机角色、动作块、辅助参数。",
    innovation: "统一生成生活协作动作与康复参数，让“做任务”与“做训练”共享策略骨架。"
  },
  action: {
    number: "MODULE 06",
    name: "动作输出",
    summary: "把策略决策转成机械臂、外骨骼可执行且随时可中止的安全动作。",
    question: "生成式动作怎样满足 ROM、速度、交互力与实时控制约束？",
    method: "轨迹/阻抗双通道输出，动作限幅，安全过滤器，异常检测与人在环接管。",
    io: "动作块 + ROM / 力约束 → 关节轨迹、速度、辅助力、阻抗与停止信号。",
    innovation: "安全层独立拥有否决权，并用执行反馈反向修正感知、意图与下一动作。"
  }
};

const fields = {
  number: document.querySelector("#detail-number"),
  name: document.querySelector("#detail-name"),
  summary: document.querySelector("#detail-summary"),
  question: document.querySelector("#detail-question"),
  method: document.querySelector("#detail-method"),
  io: document.querySelector("#detail-io"),
  innovation: document.querySelector("#detail-innovation")
};

function selectModule(button) {
  document.querySelectorAll(".module").forEach((item) => {
    const selected = item === button;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-selected", String(selected));
  });
  const data = modules[button.dataset.key];
  Object.entries(fields).forEach(([key, node]) => node.textContent = data[key]);
  document.querySelector("#module-detail").animate(
    [{ opacity: .35, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 240, easing: "ease-out" }
  );
}

document.querySelectorAll(".module").forEach((button) => {
  button.addEventListener("click", () => selectModule(button));
});
selectModule(document.querySelector(".module.active"));

const scenarios = {
  rehab: {
    code: "R-01",
    title: "健侧示范 + 患侧辅助抬臂",
    desc: "健侧手发起并示范目标动作，系统理解训练意图；机械臂/外骨骼为患侧提供随阶段变化的辅助力与轨迹约束。",
    phases: [
      ["观察", "Ego 捕捉健侧动作与目标方向"],
      ["理解", "识别抬臂意图、幅度与动作阶段"],
      ["协作", "生成患侧辅助轨迹与阻抗参数"],
      ["纠偏", "依据 ROM 与交互力实时安全修正"]
    ]
  },
  adl: {
    code: "A-01",
    title: "健侧指引 + 机械手协作递物",
    desc: "Ego 视角识别目标物与健侧手指引，机械手完成接近、抓取与递交；策略根据人的接手动作动态调整速度和释放时机。",
    phases: [
      ["观察", "识别目标物、手势与可达区域"],
      ["理解", "解析取物意图与递交目标"],
      ["协作", "分配抓取、接近与接手角色"],
      ["纠偏", "依据距离与交互状态调整动作"]
    ]
  }
};

document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-scenario]").forEach((item) => item.classList.toggle("active", item === button));
    const scenario = scenarios[button.dataset.scenario];
    document.querySelector("#scenario-code").textContent = scenario.code;
    document.querySelector("#scenario-title").textContent = scenario.title;
    document.querySelector("#scenario-desc").textContent = scenario.desc;
    document.querySelectorAll("#phase-list > div").forEach((row, index) => {
      const [title, desc] = scenario.phases[index];
      row.querySelector("strong").textContent = title;
      row.querySelector("small").textContent = desc;
    });
  });
});

const phases = [...document.querySelectorAll("#phase-list > div")];
let activePhase = 0;
setInterval(() => {
  phases[activePhase].classList.remove("active");
  activePhase = (activePhase + 1) % phases.length;
  phases[activePhase].classList.add("active");
}, 2200);

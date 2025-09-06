(() => {
  // game/engine/physics/vector.ts
  var FlatVec = class {
    X;
    Y;
    constructor(x, y) {
      this.X = x;
      this.Y = y;
    }
  };
  var VertArrayContainsFlatVec = (verts, vecToFind) => {
    return verts.some((v) => v.X === vecToFind.X && v.Y === vecToFind.Y);
  };
  var Line = class {
    X1;
    Y1;
    X2;
    Y2;
    constructor(x1, y1, x2, y2) {
      this.X1 = x1;
      this.Y1 = y1;
      this.X2 = x2;
      this.Y2 = y2;
    }
  };

  // game/engine/utils.ts
  function FillArrayWithFlatVec(fvArr) {
    for (let index = 0; index < fvArr.length; index++) {
      fvArr[index] = new FlatVec(0, 0);
    }
  }
  function Clamp(val, clamp) {
    return Math.min(Math.max(val, -clamp), clamp);
  }
  function ClampWithMin(value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }
  function Lerp(start2, end, alpha) {
    return start2 + (end - start2) * alpha;
  }
  function EaseIn(t) {
    return t * t;
  }
  var Sequencer = class {
    seq = 0;
    step;
    constructor(step) {
      if (step !== void 0) {
        this.step = step;
        return;
      }
      this.step = (seq2) => {
        return seq2 + 1;
      };
    }
    set SeqStart(val) {
      this.seq = val;
    }
    get Next() {
      const next = this.step(this.seq);
      this.seq = next;
      return next;
    }
  };

  // game/engine/finite-state-machine/PlayerStates.ts
  var seq = new Sequencer();
  seq.SeqStart = -1;
  var GAME_EVENTS = class {
    UP_SPCL_GE = seq.Next;
    DOWN_SPCL_GE = seq.Next;
    SIDE_SPCL_GE = seq.Next;
    SIDE_SPCL_EX_GE = seq.Next;
    SPCL_GE = seq.Next;
    UP_ATTACK_GE = seq.Next;
    DOWN_ATTACK_GE = seq.Next;
    SIDE_ATTACK_GE = seq.Next;
    SIDE_CHARGE_GE = seq.Next;
    SIDE_CHARGE_EX_GE = seq.Next;
    UP_CHARGE_GE = seq.Next;
    UP_CHARGE_EX_GE = seq.Next;
    DOWN_CHARGE_GE = seq.Next;
    DOWN_CHARGE_EX_GE = seq.Next;
    ATTACK_GE = seq.Next;
    DASH_ATTACK_GE = seq.Next;
    D_TILT_GE = seq.Next;
    S_TILT_GE = seq.Next;
    S_TILT_U_GE = seq.Next;
    S_TILT_D_GE = seq.Next;
    U_TILT_GE = seq.Next;
    N_AIR_GE = seq.Next;
    F_AIR_GE = seq.Next;
    B_AIR_GE = seq.Next;
    U_AIR_GE = seq.Next;
    D_AIR_GE = seq.Next;
    S_SPCL_AIR_GE = seq.Next;
    S_SPCL_EX_AIR_GE = seq.Next;
    U_SPCL_AIR_GE = seq.Next;
    D_SPCL_AIR_GE = seq.Next;
    IDLE_GE = seq.Next;
    MOVE_GE = seq.Next;
    MOVE_FAST_GE = seq.Next;
    JUMP_GE = seq.Next;
    GRAB_GE = seq.Next;
    GUARD_GE = seq.Next;
    UP_GE = seq.Next;
    DOWN_GE = seq.Next;
    // End of GameEvents that can be source from player input
    LAND_GE = seq.Next;
    SOFT_LAND_GE = seq.Next;
    FALL_GE = seq.Next;
    LEDGE_GRAB_GE = seq.Next;
    HIT_STOP_GE = seq.Next;
    LAUNCH_GE = seq.Next;
    TUBMLE_GE = seq.Next;
  };
  var GAME_EVENT_IDS = new GAME_EVENTS();
  seq.SeqStart = -1;
  var STATES = class {
    IDLE_S = seq.Next;
    TURN_S = seq.Next;
    WALK_S = seq.Next;
    DASH_S = seq.Next;
    DASH_TURN_S = seq.Next;
    STOP_RUN_S = seq.Next;
    RUN_TURN_S = seq.Next;
    STOP_RUN_TURN_S = seq.Next;
    RUN_S = seq.Next;
    JUMP_SQUAT_S = seq.Next;
    JUMP_S = seq.Next;
    N_FALL_S = seq.Next;
    LAND_S = seq.Next;
    SOFT_LAND_S = seq.Next;
    LEDGE_GRAB_S = seq.Next;
    AIR_DODGE_S = seq.Next;
    HELPESS_S = seq.Next;
    ATTACK_S = seq.Next;
    SIDE_CHARGE_S = seq.Next;
    SIDE_CHARGE_EX_S = seq.Next;
    DOWN_CHARGE_S = seq.Next;
    DOWN_CHARGE_EX_S = seq.Next;
    UP_CHARGE_S = seq.Next;
    UP_CHARGE_EX_S = seq.Next;
    DASH_ATTACK_S = seq.Next;
    DOWN_TILT_S = seq.Next;
    SIDE_TILT_S = seq.Next;
    UP_TILT_S = seq.Next;
    N_AIR_S = seq.Next;
    F_AIR_S = seq.Next;
    B_AIR_S = seq.Next;
    U_AIR_S = seq.Next;
    D_AIR_S = seq.Next;
    SIDE_SPCL_S = seq.Next;
    SIDE_SPCL_EX_S = seq.Next;
    SIDE_SPCL_AIR_S = seq.Next;
    SIDE_SPCL_EX_AIR_S = seq.Next;
    DOWN_SPCL_S = seq.Next;
    DOWN_SPCL_AIR_S = seq.Next;
    HIT_STOP_S = seq.Next;
    LAUNCH_S = seq.Next;
    TUMBLE_S = seq.Next;
    CROUCH_S = seq.Next;
  };
  var STATE_IDS = new STATES();
  seq.SeqStart = -1;
  var ATTACKS = class {
    N_GRND_ATK = seq.Next;
    S_GRND_ATK = seq.Next;
    U_GRND_ATK = seq.Next;
    D_GRND_ATK = seq.Next;
    S_CHARGE_ATK = seq.Next;
    S_CHARGE_EX_ATK = seq.Next;
    U_CHARGE_ATK = seq.Next;
    U_CHARGE_EX_ATK = seq.Next;
    D_CHARGE_ATK = seq.Next;
    D_CHARGE_EX_ATK = seq.Next;
    S_TILT_ATK = seq.Next;
    S_TILT_U_ATK = seq.Next;
    S_TITL_D_ATK = seq.Next;
    U_TILT_ATK = seq.Next;
    D_TILT_ATK = seq.Next;
    DASH_ATK = seq.Next;
    N_AIR_ATK = seq.Next;
    F_AIR_ATK = seq.Next;
    B_AIR_ATK = seq.Next;
    U_AIR_ATK = seq.Next;
    D_AIR_ATK = seq.Next;
    N_SPCL_ATK = seq.Next;
    S_SPCL_ATK = seq.Next;
    S_SPCL_EX_ATK = seq.Next;
    S_SPCL_AIR_ATK = seq.Next;
    S_SPCL_EX_AIR_ATK = seq.Next;
    U_SPCL_ATK = seq.Next;
    D_SPCL_ATK = seq.Next;
    D_SPCL_AIR_ATK = seq.Next;
  };
  var ATTACK_IDS = new ATTACKS();
  function CanStateWalkOffLedge(stateId) {
    switch (stateId) {
      case STATE_IDS.IDLE_S:
        return false;
      case STATE_IDS.WALK_S:
        return false;
      case STATE_IDS.RUN_TURN_S:
        return false;
      case STATE_IDS.STOP_RUN_S:
        return false;
      case STATE_IDS.DASH_ATTACK_S:
        return false;
      case STATE_IDS.ATTACK_S:
        return false;
      case STATE_IDS.SIDE_TILT_S:
        return false;
      case STATE_IDS.UP_TILT_S:
        return false;
      case STATE_IDS.DOWN_TILT_S:
        return false;
      case STATE_IDS.SIDE_CHARGE_S:
        return false;
      case STATE_IDS.SIDE_CHARGE_EX_S:
        return false;
      case STATE_IDS.UP_CHARGE_S:
        return false;
      case STATE_IDS.UP_CHARGE_EX_S:
        return false;
      case STATE_IDS.CROUCH_S:
        return false;
      case STATE_IDS.LEDGE_GRAB_S:
        return false;
      default:
        return true;
    }
  }
  var StateRelation = class {
    stateId;
    mappings;
    constructor(stateId, actionStateTranslations) {
      this.stateId = stateId;
      this.mappings = actionStateTranslations;
    }
  };
  var ActionStateMappings = class {
    mappings = /* @__PURE__ */ new Map();
    condtions;
    defaultConditions;
    GetMapping(geId) {
      return this.mappings.get(geId);
    }
    GetConditions() {
      return this.condtions;
    }
    GetDefaults() {
      return this.defaultConditions;
    }
    SetMappings(mappingsArray) {
      mappingsArray.forEach((actSt) => {
        this.mappings.set(actSt.geId, actSt.sId);
      });
    }
    SetConditions(conditions) {
      this.condtions = conditions;
    }
    SetDefaults(conditions) {
      if (!this.defaultConditions) {
        this.defaultConditions = conditions;
      }
    }
  };
  function RunCondition(c, w, playerIndex) {
    if (c.ConditionFunc(w, playerIndex) === true) {
      return c.StateId;
    }
    return void 0;
  }
  var IdleToTurn = {
    Name: "IdleToTurn",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const flags = p.Flags;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis < 0 && flags.IsFacingRight) {
        return true;
      }
      if (ia.LXAxis > 0 && flags.IsFacingLeft) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.TURN_S
  };
  var IdleToDash = {
    Name: "IdleToDash",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
        return false;
      }
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
        return false;
      }
      const facingRight = p.Flags.IsFacingRight;
      const lxAxis = ia.LXAxis;
      if (lxAxis > 0 && facingRight) {
        return true;
      }
      if (lxAxis < 0 && !facingRight) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.DASH_S
  };
  var IdleToDashturn = {
    Name: "IdleToTurnDash",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
        return false;
      }
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
        return false;
      }
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      const lxAxis = ia.LXAxis;
      if (lxAxis < 0 && flags.IsFacingRight) {
        return true;
      }
      if (lxAxis > 0 && flags.IsFacingLeft) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.DASH_TURN_S
  };
  var WalkToDash = {
    Name: "WalkToDash",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const fsmInfo = p.FSMInfo;
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (fsmInfo.CurrentStateFrame > 2 || prevIa.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
        return false;
      }
      const flags = p.Flags;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (flags.IsFacingRight && ia.LXAxis > 0 && ia.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
        return true;
      }
      if (flags.IsFacingLeft && ia.LXAxis < 0 && ia.Action === GAME_EVENT_IDS.MOVE_FAST_GE) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.DASH_S
  };
  var WalkToTurn = {
    Name: "WalkToTurn",
    ConditionFunc: (w, playerIndex) => {
      const player = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (prevIa === void 0) {
        return false;
      }
      const prevLax = prevIa.LXAxis;
      const curLax = ia.LXAxis;
      if (prevLax < 0 && curLax > 0 || prevLax > 0 && curLax < 0) {
        return true;
      }
      const flags = player.Flags;
      if (prevLax === 0 && flags.IsFacingRight && curLax < 0 || prevLax === 0 && flags.IsFacingLeft && curLax > 0) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.TURN_S
  };
  var RunToTurn = {
    Name: "RunToTurn",
    ConditionFunc: (w, playerIndex) => {
      const player = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (prevIa === void 0) {
        return false;
      }
      const prevLax = prevIa.LXAxis;
      const curLax = ia.LXAxis;
      if (prevLax < 0 && curLax > 0 || prevLax > 0 && curLax < 0) {
        return true;
      }
      const flags = player.Flags;
      if (prevLax === 0 && flags.IsFacingRight && curLax < 0 || prevLax === 0 && flags.IsFacingLeft && curLax > 0) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.RUN_TURN_S
  };
  var DashToTurn = {
    Name: "DashToTurn",
    ConditionFunc: (w, playerIndex) => {
      const player = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (prevIa === void 0) {
        return false;
      }
      const prevLax = prevIa.LXAxis;
      const curLax = ia.LXAxis;
      const laxDifference = curLax - prevLax;
      const threshold = 0.5;
      const flags = player.Flags;
      const facingRight = flags.IsFacingRight;
      if (laxDifference < -threshold && facingRight) {
        if (curLax < 0) {
          return true;
        }
      }
      if (laxDifference > threshold && !facingRight) {
        if (curLax > 0) {
          return true;
        }
      }
      return false;
    },
    StateId: STATE_IDS.DASH_TURN_S
  };
  var ToJump = {
    Name: "ToJump",
    ConditionFunc: (w, playerIndex) => {
      const player = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const jumpId = GAME_EVENT_IDS.JUMP_GE;
      if (inputMacthesTargetNotRepeating(jumpId, ia, prevIa) && player.Jump.HasJumps()) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.JUMP_S
  };
  var ToAirDodge = {
    Name: "ToAirDodge",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      return isBufferedInput(inputStore, curFrame, 3, GAME_EVENT_IDS.GUARD_GE);
    },
    StateId: STATE_IDS.AIR_DODGE_S
  };
  var DashDefaultRun = {
    Name: "DashDefaultRun",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis > 0 && flags.IsFacingRight) {
        return true;
      }
      if (ia.LXAxis < 0 && flags.IsFacingLeft) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.RUN_S
  };
  var DashDefaultIdle = {
    Name: "DashDefaultIdle",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis === 0) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.IDLE_S
  };
  var TurnDefaultWalk = {
    Name: "TurnDefaultWalk",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const p = w.PlayerData.Player(playerIndex);
      const facingRight = p?.Flags.IsFacingRight;
      if (facingRight && ia.LXAxis < 0 || !facingRight && ia.LXAxis > 0) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.WALK_S
  };
  var TurnToDash = {
    Name: "TurnToDash",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const stateFrame = p.FSMInfo.CurrentStateFrame;
      if (stateFrame > 2) {
        return false;
      }
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis < -0.5 && p.Flags.IsFacingRight || ia.LXAxis > 0.5 && p.Flags.IsFacingLeft) {
        const prevIa = inputStore.GetInputForFrame(w.PreviousFrame);
        return inputMacthesTargetNotRepeating(
          GAME_EVENT_IDS.MOVE_FAST_GE,
          ia,
          prevIa
        );
      }
      return false;
    },
    StateId: STATE_IDS.DASH_S
  };
  var ToNair = {
    Name: "ToNAir",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.ATTACK_GE, ia, prevIa);
    },
    StateId: STATE_IDS.N_AIR_S
  };
  var ToFAir = {
    Name: "ToFAir",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (ia.Action === prevIa.Action) {
        return false;
      }
      if (ia.Action !== GAME_EVENT_IDS.SIDE_ATTACK_GE) {
        return false;
      }
      const isFacingRight = p?.Flags.IsFacingRight;
      const IsFacingLeft = !isFacingRight;
      const isRStickXAxisActuated = Math.abs(ia.RXAxis) > 0;
      if (isRStickXAxisActuated === true) {
        if (isFacingRight && ia.RXAxis > 0) {
          return true;
        }
        if (IsFacingLeft && ia.RXAxis < 0) {
          return true;
        }
      }
      if (isRStickXAxisActuated === false) {
        if (isFacingRight && ia.LXAxis > 0) {
          return true;
        }
        if (IsFacingLeft && ia.LXAxis < 0) {
          return true;
        }
      }
      return false;
    },
    StateId: STATE_IDS.F_AIR_S
  };
  var ToBAir = {
    Name: "ToBAir",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (ia.Action === prevIa?.Action) {
        return false;
      }
      if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
        if (p.Flags.IsFacingRight && (ia.RXAxis < 0 || ia.LXAxis < 0)) {
          return true;
        }
        if (p.Flags.IsFacingLeft && (ia.RXAxis > 0 || ia.LXAxis > 0)) {
          return true;
        }
      }
      return false;
    },
    StateId: STATE_IDS.B_AIR_S
  };
  var ToUAir = {
    Name: "UAir",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        prevIa
      );
    },
    StateId: STATE_IDS.U_AIR_S
  };
  var ToDAir = {
    Name: "UAir",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.DOWN_ATTACK_GE,
        ia,
        prevIa
      );
    },
    StateId: STATE_IDS.D_AIR_S
  };
  var SideTiltToWalk = {
    Name: "SideTiltToWalk",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action !== GAME_EVENT_IDS.MOVE_GE || ia.Action !== GAME_EVENT_IDS.MOVE_FAST_GE) {
        return false;
      }
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      if (ia.LXAxis > 0 && flags.IsFacingRight) {
        return true;
      }
      if (ia.LXAxis < 0 && flags.IsFacingLeft) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.WALK_S
  };
  var defaultWalk = {
    Name: "Walk",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.WALK_S
  };
  var defaultRun = {
    Name: "Run",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.RUN_S
  };
  var defaultIdle = {
    Name: "Idle",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.IDLE_S
  };
  var defaultDash = {
    Name: "Dash",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.DASH_S
  };
  var defaultJump = {
    Name: "Jump",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.JUMP_S
  };
  var defaultNFall = {
    Name: "NFall",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.N_FALL_S
  };
  var defaultHelpess = {
    Name: "Helpless",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.HELPESS_S
  };
  var defaultSideChargeEx = {
    Name: "DefaultSideChargeEx",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.SIDE_CHARGE_EX_S
  };
  var defaultUpChargeEx = {
    Name: "DefaultUpChargeToEx",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.UP_CHARGE_EX_S
  };
  var defaultDownChargeEx = {
    Name: "DefaultDownChargeEx",
    ConditionFunc: (w, playerIndex) => {
      return true;
    },
    StateId: STATE_IDS.DOWN_CHARGE_EX_S
  };
  var LandToIdle = {
    Name: "LandToIdle",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis === 0) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.IDLE_S
  };
  var LandToWalk = {
    Name: "LandToWalk",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis > 0 && flags.IsFacingRight) {
        return true;
      }
      if (ia.LXAxis < 0 && flags.IsFacingLeft) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.WALK_S
  };
  var LandToTurn = {
    Name: "LandToTurn",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis < 0 && flags.IsFacingRight) {
        return true;
      }
      if (ia.LXAxis > 0 && flags.IsFacingLeft) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.TURN_S
  };
  var DefaultDownTiltToCrouch = {
    Name: "DefaultDownTiltToCrouch",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action === GAME_EVENT_IDS.DOWN_GE) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.CROUCH_S
  };
  var RunStopToTurn = {
    Name: "RunStopToTurn",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LXAxis > 0 && flags.IsFacingLeft) {
        return true;
      }
      if (ia.LXAxis < 0 && flags.IsFacingRight) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.RUN_TURN_S
  };
  var IdleToAttack = {
    Name: "IdleToAttack",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(GAME_EVENT_IDS.ATTACK_GE, ia, prevIa);
    },
    StateId: STATE_IDS.ATTACK_S
  };
  var ToSideCharge = {
    Name: "ToSideCharge",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.SIDE_ATTACK_GE,
        ia,
        prevIa
      ) === false) {
        return false;
      }
      const rxAbs = Math.abs(ia.RXAxis);
      if (rxAbs > 0 && rxAbs > Math.abs(ia.RYAxis)) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.SIDE_CHARGE_S
  };
  var IdleToUpTilt = {
    Name: "IdleToUpTilt",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        prevIa
      ) === false) {
        return false;
      }
      if (ia.RYAxis > 0) {
        return false;
      }
      return true;
    },
    StateId: STATE_IDS.UP_TILT_S
  };
  var ToUpCharge = {
    Name: "ToUpCharge",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.UP_ATTACK_GE,
        ia,
        prevIa
      ) === false) {
        return false;
      }
      if (Math.abs(ia.RYAxis) > Math.abs(ia.RXAxis) === false) {
        return false;
      }
      return true;
    },
    StateId: STATE_IDS.UP_CHARGE_S
  };
  var ToDownCharge = {
    Name: "ToDownCharge",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      if (inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.DOWN_ATTACK_GE,
        ia,
        prevIa
      ) === false) {
        return false;
      }
      if (ia.RYAxis >= 0) {
        return false;
      }
      if (Math.abs(ia.RYAxis) > Math.abs(ia.RXAxis) === false) {
        return false;
      }
      return true;
    },
    StateId: STATE_IDS.DOWN_CHARGE_S
  };
  var RunToDashAttack = {
    Name: "ToDashAttack",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action === GAME_EVENT_IDS.SIDE_ATTACK_GE) {
        if (Math.abs(ia.RXAxis) > 0) {
          return false;
        }
        const facingRight = p.Flags.IsFacingRight;
        if (ia.LXAxis > 0 && facingRight || ia.LXAxis < 0 && facingRight === false) {
          return true;
        }
      }
      return false;
    },
    StateId: STATE_IDS.DASH_ATTACK_S
  };
  var ToSideTilt = {
    Name: "ToSideTilt",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action !== GAME_EVENT_IDS.SIDE_ATTACK_GE) {
        return false;
      }
      if (Math.abs(ia.RXAxis) > 0) {
        return false;
      }
      const facingRight = p.Flags.IsFacingRight;
      if (ia.LXAxis > 0 && facingRight || ia.LXAxis < 0 && !facingRight) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.SIDE_TILT_S
  };
  var ToSideSpecial = {
    Name: "ToSideSpecial",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.SIDE_SPCL_GE,
        ia,
        prevIa
      );
    },
    StateId: STATE_IDS.SIDE_SPCL_S
  };
  var ToSideSpecialAir = {
    Name: "ToSideSpecialAir",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.SIDE_SPCL_GE,
        ia,
        prevIa
      );
    },
    StateId: STATE_IDS.SIDE_SPCL_AIR_S
  };
  var ToDownSpecial = {
    Name: "IdleToDownSpecial",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.DOWN_SPCL_GE,
        ia,
        prevIa
      );
    },
    StateId: STATE_IDS.DOWN_SPCL_S
  };
  var ToDownTilt = {
    Name: "ToDownTilt",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      return inputMacthesTargetNotRepeating(
        GAME_EVENT_IDS.DOWN_ATTACK_GE,
        ia,
        prevIa
      );
    },
    StateId: STATE_IDS.DOWN_TILT_S
  };
  var HitStopToLaunch = {
    Name: "HitStopToLaunch",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      if (p.HitStop.HitStopFrames > 0) {
        return false;
      }
      return true;
    },
    StateId: STATE_IDS.LAUNCH_S
  };
  var LaunchToTumble = {
    Name: "LaunchToHitStun",
    ConditionFunc: (w, playerIndex) => {
      const p = w.PlayerData.Player(playerIndex);
      if (p.HitStun.FramesOfHitStun > 0) {
        return false;
      }
      return true;
    },
    StateId: STATE_IDS.TUMBLE_S
  };
  var SideChargeToEx = {
    Name: "SideChargeToEx",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
        return true;
      }
      const p = w.PlayerData.Player(playerIndex);
      const flags = p.Flags;
      if (flags.IsFacingRight && ia.RXAxis <= 0) {
        return true;
      }
      if (flags.IsFacingLeft && ia.RXAxis >= 0) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.SIDE_CHARGE_EX_S
  };
  var UpChargeToEx = {
    Name: "UpChargeToEx",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
        return true;
      }
      if (ia.RYAxis <= 0.1) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.UP_CHARGE_EX_S
  };
  var DownChargeToEx = {
    Name: "DownChargeToEx",
    ConditionFunc: (w, playerIndex) => {
      const inputStore = w.PlayerData.InputStore(playerIndex);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.Action === GAME_EVENT_IDS.IDLE_GE) {
        return true;
      }
      if (ia.RYAxis >= -0.1) {
        return true;
      }
      return false;
    },
    StateId: STATE_IDS.DOWN_CHARGE_EX_S
  };
  function InitIdleRelations() {
    const idleTranslations = new ActionStateMappings();
    idleTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S }
    ]);
    const condtions = [
      IdleToDash,
      IdleToDashturn,
      IdleToTurn,
      IdleToAttack,
      ToSideCharge,
      ToUpCharge,
      IdleToUpTilt,
      ToDownCharge,
      ToSideSpecial,
      ToDownSpecial
    ];
    idleTranslations.SetConditions(condtions);
    const idle = new StateRelation(STATE_IDS.IDLE_S, idleTranslations);
    return idle;
  }
  function InitTurnRelations() {
    const turnTranslations = new ActionStateMappings();
    turnTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    const defaultConditions = [
      TurnDefaultWalk,
      defaultIdle,
      ToSideSpecial
    ];
    turnTranslations.SetConditions([TurnToDash, ToSideSpecial, ToSideTilt]);
    turnTranslations.SetDefaults(defaultConditions);
    const turnWalk = new StateRelation(STATE_IDS.TURN_S, turnTranslations);
    return turnWalk;
  }
  function InitWalkRelations() {
    const walkTranslations = new ActionStateMappings();
    walkTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S }
    ]);
    const conditions = [
      WalkToTurn,
      WalkToDash,
      ToSideSpecial,
      ToSideCharge,
      ToDownCharge,
      ToUpCharge,
      ToSideTilt
    ];
    walkTranslations.SetConditions(conditions);
    const walkRelations = new StateRelation(STATE_IDS.WALK_S, walkTranslations);
    return walkRelations;
  }
  function InitDashRelations() {
    const dashTranslations = new ActionStateMappings();
    dashTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    const conditions = [
      DashToTurn,
      ToSideSpecial,
      RunToDashAttack
    ];
    dashTranslations.SetConditions(conditions);
    const defaultConditions = [
      DashDefaultRun,
      defaultIdle
    ];
    dashTranslations.SetDefaults(defaultConditions);
    const dashRelations = new StateRelation(STATE_IDS.DASH_S, dashTranslations);
    return dashRelations;
  }
  function InitDashTurnRelations() {
    const dashTrunTranslations = new ActionStateMappings();
    dashTrunTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    dashTrunTranslations.SetConditions([ToSideSpecial]);
    dashTrunTranslations.SetDefaults([defaultDash]);
    const dashTurnRelations = new StateRelation(
      STATE_IDS.DASH_TURN_S,
      dashTrunTranslations
    );
    return dashTurnRelations;
  }
  function InitRunRelations() {
    const runTranslations = new ActionStateMappings();
    runTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.STOP_RUN_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S }
    ]);
    const conditions = [
      RunToTurn,
      ToSideSpecial,
      RunToDashAttack
    ];
    runTranslations.SetConditions(conditions);
    const runRelations = new StateRelation(STATE_IDS.RUN_S, runTranslations);
    return runRelations;
  }
  function InitRunTurnRelations() {
    const runTurnMapping = new ActionStateMappings();
    runTurnMapping.SetMappings([
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    runTurnMapping.SetConditions([ToSideSpecial]);
    runTurnMapping.SetDefaults([defaultRun]);
    const runTurnRelations = new StateRelation(
      STATE_IDS.RUN_TURN_S,
      runTurnMapping
    );
    return runTurnRelations;
  }
  function InitStopRunRelations() {
    const stopRunTranslations = new ActionStateMappings();
    stopRunTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.DOWN_GE, sId: STATE_IDS.CROUCH_S },
      { geId: GAME_EVENT_IDS.SIDE_SPCL_GE, sId: STATE_IDS.SIDE_SPCL_S }
    ]);
    const conditions = [RunStopToTurn];
    stopRunTranslations.SetConditions(conditions);
    stopRunTranslations.SetDefaults([defaultIdle]);
    const stopRunRelations = new StateRelation(
      STATE_IDS.STOP_RUN_S,
      stopRunTranslations
    );
    return stopRunRelations;
  }
  function InitJumpSquatRelations() {
    const jumpSquatTranslations = new ActionStateMappings();
    jumpSquatTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    jumpSquatTranslations.SetDefaults([defaultJump]);
    const jumpSquatRelations = new StateRelation(
      STATE_IDS.JUMP_SQUAT_S,
      jumpSquatTranslations
    );
    return jumpSquatRelations;
  }
  function InitJumpRelations() {
    const jumpTranslations = new ActionStateMappings();
    jumpTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    jumpTranslations.SetConditions([ToJump, ToAirDodge]);
    jumpTranslations.SetDefaults([defaultNFall]);
    const jumpRelations = new StateRelation(STATE_IDS.JUMP_S, jumpTranslations);
    return jumpRelations;
  }
  function InitNeutralFallRelations() {
    const nFallTranslations = new ActionStateMappings();
    nFallTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    nFallTranslations.SetConditions([
      ToJump,
      ToAirDodge,
      ToNair,
      ToUAir,
      ToDAir,
      ToFAir,
      ToBAir,
      ToSideSpecialAir
    ]);
    const nFallRelations = new StateRelation(
      STATE_IDS.N_FALL_S,
      nFallTranslations
    );
    return nFallRelations;
  }
  function InitLandRelations() {
    const landTranslations = new ActionStateMappings();
    landTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S }
    ]);
    landTranslations.SetDefaults([LandToIdle, LandToWalk, LandToTurn]);
    const landRelations = new StateRelation(STATE_IDS.LAND_S, landTranslations);
    return landRelations;
  }
  function InitSoftLandRelations() {
    const softLandTranslations = new ActionStateMappings();
    softLandTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S }
    ]);
    softLandTranslations.SetDefaults([LandToIdle, LandToWalk, LandToTurn]);
    const softLandRelations = new StateRelation(
      STATE_IDS.SOFT_LAND_S,
      softLandTranslations
    );
    return softLandRelations;
  }
  function InitLedgeGrabRelations() {
    const LedgeGrabTranslations = new ActionStateMappings();
    LedgeGrabTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_S }
    ]);
    const LedgeGrabRelations = new StateRelation(
      STATE_IDS.LEDGE_GRAB_S,
      LedgeGrabTranslations
    );
    return LedgeGrabRelations;
  }
  function InitAirDodgeRelations() {
    const airDodgeTranslations = new ActionStateMappings();
    airDodgeTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S }
    ]);
    airDodgeTranslations.SetDefaults([defaultHelpess]);
    const AirDodgeRelations = new StateRelation(
      STATE_IDS.AIR_DODGE_S,
      airDodgeTranslations
    );
    return AirDodgeRelations;
  }
  function InitHelpessRelations() {
    const helpessTranslations = new ActionStateMappings();
    helpessTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S }
    ]);
    const HelplessRelations = new StateRelation(
      STATE_IDS.HELPESS_S,
      helpessTranslations
    );
    return HelplessRelations;
  }
  function InitAttackRelations() {
    const attackTranslations = new ActionStateMappings();
    attackTranslations.SetDefaults([defaultIdle]);
    const attackRelations = new StateRelation(
      STATE_IDS.ATTACK_S,
      attackTranslations
    );
    return attackRelations;
  }
  function InitDashAttackRelations() {
    const dashAtkTranslations = new ActionStateMappings();
    dashAtkTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    dashAtkTranslations.SetDefaults([defaultIdle]);
    const dashAtkRelations = new StateRelation(
      STATE_IDS.DASH_ATTACK_S,
      dashAtkTranslations
    );
    return dashAtkRelations;
  }
  function InitSideChargeRelations() {
    const sideChargeTranslations = new ActionStateMappings();
    sideChargeTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    sideChargeTranslations.SetConditions([SideChargeToEx]);
    sideChargeTranslations.SetDefaults([defaultSideChargeEx]);
    const sideChargeRelations = new StateRelation(
      STATE_IDS.SIDE_CHARGE_S,
      sideChargeTranslations
    );
    return sideChargeRelations;
  }
  function InitSideChargeExRelations() {
    const sideChargeExTranslations = new ActionStateMappings();
    sideChargeExTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    sideChargeExTranslations.SetDefaults([defaultIdle]);
    const relation = new StateRelation(
      STATE_IDS.SIDE_CHARGE_EX_S,
      sideChargeExTranslations
    );
    return relation;
  }
  function InitUpChargeRelations() {
    const upChargeRelations = new ActionStateMappings();
    upChargeRelations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    upChargeRelations.SetConditions([UpChargeToEx]);
    upChargeRelations.SetDefaults([defaultUpChargeEx]);
    const relation = new StateRelation(STATE_IDS.UP_CHARGE_S, upChargeRelations);
    return relation;
  }
  function InitiUpChargeExRelations() {
    const translations = new ActionStateMappings();
    translations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    translations.SetDefaults([defaultIdle]);
    const relation = new StateRelation(STATE_IDS.UP_CHARGE_EX_S, translations);
    return relation;
  }
  function InitDownChargeRelations() {
    const downChargeRelations = new ActionStateMappings();
    downChargeRelations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    downChargeRelations.SetConditions([DownChargeToEx]);
    downChargeRelations.SetDefaults([defaultDownChargeEx]);
    const relation = new StateRelation(
      STATE_IDS.DOWN_CHARGE_S,
      downChargeRelations
    );
    return relation;
  }
  function InitDownChargeExRelations() {
    const translations = new ActionStateMappings();
    translations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    translations.SetDefaults([defaultIdle]);
    const relation = new StateRelation(STATE_IDS.DOWN_CHARGE_EX_S, translations);
    return relation;
  }
  function InitAirAttackRelations() {
    const airAttackTranslations = new ActionStateMappings();
    airAttackTranslations.SetDefaults([defaultNFall]);
    airAttackTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S }
    ]);
    const airAttackRelations = new StateRelation(
      STATE_IDS.N_AIR_S,
      airAttackTranslations
    );
    return airAttackRelations;
  }
  function InitFAirAttackRelations() {
    const fAirAttackTranslations = new ActionStateMappings();
    fAirAttackTranslations.SetDefaults([defaultNFall]);
    fAirAttackTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S }
    ]);
    const fAirTranslations = new StateRelation(
      STATE_IDS.F_AIR_S,
      fAirAttackTranslations
    );
    return fAirTranslations;
  }
  function InitUAirRelations() {
    const uAirTranslations = new ActionStateMappings();
    uAirTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S }
    ]);
    uAirTranslations.SetDefaults([defaultNFall]);
    const uAirRelations = new StateRelation(STATE_IDS.U_AIR_S, uAirTranslations);
    return uAirRelations;
  }
  function InitBAirRelations() {
    const bAirTranslations = new ActionStateMappings();
    bAirTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S }
    ]);
    bAirTranslations.SetDefaults([defaultNFall]);
    const bAirRelations = new StateRelation(STATE_IDS.B_AIR_S, bAirTranslations);
    return bAirRelations;
  }
  function InitDAirRelations() {
    const dAirTranslations = new ActionStateMappings();
    dAirTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.SOFT_LAND_S },
      { geId: GAME_EVENT_IDS.LEDGE_GRAB_GE, sId: STATE_IDS.LEDGE_GRAB_S }
    ]);
    dAirTranslations.SetDefaults([defaultNFall]);
    const bAirRelations = new StateRelation(STATE_IDS.D_AIR_S, dAirTranslations);
    return bAirRelations;
  }
  function InitSideSpecialRelations() {
    const sideSpclTranslations = new ActionStateMappings();
    sideSpclTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.HELPESS_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      {
        geId: GAME_EVENT_IDS.SIDE_SPCL_EX_GE,
        sId: STATE_IDS.SIDE_SPCL_EX_S
      }
    ]);
    sideSpclTranslations.SetDefaults([defaultIdle]);
    const sideSpecialRelations = new StateRelation(
      STATE_IDS.SIDE_SPCL_S,
      sideSpclTranslations
    );
    return sideSpecialRelations;
  }
  function InitSideSpecialExtensionRelations() {
    const sideSpclExTranslations = new ActionStateMappings();
    sideSpclExTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    sideSpclExTranslations.SetDefaults([defaultIdle]);
    const sideSpclExRelations = new StateRelation(
      STATE_IDS.SIDE_SPCL_EX_S,
      sideSpclExTranslations
    );
    return sideSpclExRelations;
  }
  function InitSideSpecialAirRelations() {
    const translation = new ActionStateMappings();
    translation.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      {
        geId: GAME_EVENT_IDS.S_SPCL_EX_AIR_GE,
        sId: STATE_IDS.SIDE_SPCL_EX_AIR_S
      }
    ]);
    translation.SetDefaults([defaultHelpess]);
    const relation = new StateRelation(STATE_IDS.SIDE_SPCL_AIR_S, translation);
    return relation;
  }
  function InitSideSpecialExAirRelations() {
    const translations = new ActionStateMappings();
    translations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    translations.SetDefaults([defaultHelpess]);
    const relations = new StateRelation(
      STATE_IDS.SIDE_SPCL_EX_AIR_S,
      translations
    );
    return relations;
  }
  function InitDownSpecialRelations() {
    const downSpecialTranslations = new ActionStateMappings();
    downSpecialTranslations.SetDefaults([defaultIdle]);
    const downSpecRelations = new StateRelation(
      STATE_IDS.DOWN_SPCL_S,
      downSpecialTranslations
    );
    return downSpecRelations;
  }
  function InitHitStopRelations() {
    const hitStopTranslations = new ActionStateMappings();
    const hitStopConditions = [HitStopToLaunch];
    hitStopTranslations.SetConditions(hitStopConditions);
    const hitStunRelations = new StateRelation(
      STATE_IDS.HIT_STOP_S,
      hitStopTranslations
    );
    return hitStunRelations;
  }
  function InitTumbleRelations() {
    const TumbleTranslations = new ActionStateMappings();
    TumbleTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.LAND_GE, sId: STATE_IDS.LAND_S },
      { geId: GAME_EVENT_IDS.SOFT_LAND_GE, sId: STATE_IDS.LAND_S }
    ]);
    TumbleTranslations.SetConditions([ToJump]);
    const TumbleRelations = new StateRelation(
      STATE_IDS.TUMBLE_S,
      TumbleTranslations
    );
    return TumbleRelations;
  }
  function InitLaunchRelations() {
    const launchTranslations = new ActionStateMappings();
    launchTranslations.SetConditions([LaunchToTumble]);
    const launchRelations = new StateRelation(
      STATE_IDS.LAUNCH_S,
      launchTranslations
    );
    return launchRelations;
  }
  function InitCrouchRelations() {
    const crouchTranslations = new ActionStateMappings();
    crouchTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.IDLE_GE, sId: STATE_IDS.IDLE_S },
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S },
      { geId: GAME_EVENT_IDS.MOVE_GE, sId: STATE_IDS.WALK_S },
      { geId: GAME_EVENT_IDS.MOVE_FAST_GE, sId: STATE_IDS.DASH_S },
      { geId: GAME_EVENT_IDS.JUMP_GE, sId: STATE_IDS.JUMP_SQUAT_S },
      { geId: GAME_EVENT_IDS.FALL_GE, sId: STATE_IDS.N_FALL_S }
    ]);
    crouchTranslations.SetConditions([ToDownSpecial, ToDownTilt]);
    const crouchRelations = new StateRelation(
      STATE_IDS.CROUCH_S,
      crouchTranslations
    );
    return crouchRelations;
  }
  function InitDownTiltRelations() {
    const dTiltTranslations = new ActionStateMappings();
    dTiltTranslations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    dTiltTranslations.SetDefaults([DefaultDownTiltToCrouch, defaultIdle]);
    const dTiltRelations = new StateRelation(
      STATE_IDS.DOWN_TILT_S,
      dTiltTranslations
    );
    return dTiltRelations;
  }
  function InitSideTiltRelations() {
    const sideTiltTrnalsations = new ActionStateMappings();
    sideTiltTrnalsations.SetMappings([
      { geId: GAME_EVENT_IDS.HIT_STOP_GE, sId: STATE_IDS.HIT_STOP_S }
    ]);
    sideTiltTrnalsations.SetDefaults([defaultIdle]);
    const sideTiltRelations = new StateRelation(
      STATE_IDS.SIDE_TILT_S,
      sideTiltTrnalsations
    );
    return sideTiltRelations;
  }
  function InitUpTiltRelations() {
    const upTiltTranslations = new ActionStateMappings();
    upTiltTranslations.SetMappings([
      {
        geId: GAME_EVENT_IDS.HIT_STOP_GE,
        sId: STATE_IDS.HIT_STOP_S
      }
    ]);
    upTiltTranslations.SetDefaults([defaultIdle]);
    const upTiltRelations = new StateRelation(
      STATE_IDS.UP_TILT_S,
      upTiltTranslations
    );
    return upTiltRelations;
  }
  var Idle = {
    StateName: "IDLE",
    StateId: STATE_IDS.IDLE_S,
    OnEnter: (p, w) => {
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
    }
  };
  var Walk = {
    StateName: "WALK",
    StateId: STATE_IDS.WALK_S,
    OnEnter: (p, w) => {
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia !== void 0) {
        p.AddWalkImpulseToPlayer(ia.LXAxis);
      }
    },
    OnExit: (p, w) => {
    }
  };
  var Turn = {
    StateName: "TURN",
    StateId: STATE_IDS.TURN_S,
    OnEnter: (p, W) => {
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.Flags.ChangeDirections();
    }
  };
  var Dash = {
    StateName: "DASH",
    StateId: STATE_IDS.DASH_S,
    OnEnter: (p, w) => {
      const flags = p.Flags;
      const MaxDashSpeed = p.Speeds.MaxDashSpeed;
      const impulse = flags.IsFacingRight ? Math.floor(MaxDashSpeed / 0.33) : -Math.floor(MaxDashSpeed / 0.33);
      p.Velocity.AddClampedXImpulse(MaxDashSpeed, impulse);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const speedsComp = p.Speeds;
      const dashSpeedMultiplier = speedsComp.DashMultiplier;
      const impulse = (ia?.LXAxis ?? 0) * dashSpeedMultiplier;
      p.Velocity.AddClampedXImpulse(speedsComp.MaxDashSpeed, impulse);
    },
    OnExit: (p, w) => {
    }
  };
  var DashTurn = {
    StateName: "DASH_TURN",
    StateId: STATE_IDS.DASH_TURN_S,
    OnEnter: (p, w) => {
      p.Velocity.X = 0;
      p.Flags.ChangeDirections();
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
    }
  };
  var Run = {
    StateName: "RUN",
    StateId: STATE_IDS.RUN_S,
    OnEnter: (p, w) => {
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia !== void 0) {
        const speeds = p.Speeds;
        p.Velocity.AddClampedXImpulse(
          speeds.MaxRunSpeed,
          ia.LXAxis * speeds.RunSpeedMultiplier
        );
      }
    },
    OnExit: (p, w) => {
    }
  };
  var RunTurn = {
    StateName: "RUN_TURN",
    StateId: STATE_IDS.RUN_TURN_S,
    OnEnter: (p, w) => {
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.Flags.ChangeDirections();
    }
  };
  var RunStop = {
    StateName: "RUN_STOP",
    StateId: STATE_IDS.STOP_RUN_S,
    OnEnter: (p, w) => {
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
    }
  };
  var JumpSquat = {
    StateName: "JUMPSQUAT",
    StateId: STATE_IDS.JUMP_SQUAT_S,
    OnEnter: (p, w) => {
      p.ECB.SetECBShape(STATE_IDS.JUMP_SQUAT_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var Jump = {
    StateName: "JUMP",
    StateId: STATE_IDS.JUMP_S,
    OnEnter: (p, w) => {
      const jumpComp = p.Jump;
      p.Flags.FastFallOff();
      jumpComp.IncrementJumps();
      p.ECB.SetECBShape(STATE_IDS.JUMP_S);
      p.AddToPlayerYPosition(-p.ECB.YOffset - 5);
    },
    OnUpdate: (p, w) => {
      if (p.FSMInfo.CurrentStateFrame === 1) {
        p.Velocity.Y = -p.Jump.JumpVelocity;
      }
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const speedsComp = p.Speeds;
      p.Velocity.AddClampedXImpulse(
        speedsComp.AerialSpeedInpulseLimit,
        (ia?.LXAxis ?? 0) * speedsComp.ArielVelocityMultiplier
      );
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var NeutralFall = {
    StateName: "NFALL",
    StateId: STATE_IDS.N_FALL_S,
    OnEnter: (p, w) => {
      if (p.Jump.JumpCountIsZero()) {
        p.Jump.IncrementJumps();
      }
      p.ECB.SetECBShape(STATE_IDS.N_FALL_S);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const speedsComp = p.Speeds;
      if (p.Velocity.Y > 0 && ia.LYAxis < -0.8 && prevIa.LYAxis > -0.8) {
        p.Flags.FastFallOn();
      }
      p.Velocity.AddClampedXImpulse(
        speedsComp.AerialSpeedInpulseLimit,
        ia.LXAxis * speedsComp.ArielVelocityMultiplier
      );
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var Land = {
    StateName: "Land",
    StateId: STATE_IDS.LAND_S,
    OnEnter: (p, w) => {
      p.Flags.FastFallOff();
      p.Jump.ResetJumps();
      p.Velocity.Y = 0;
      p.LedgeDetector.ZeroLedgeGrabCount();
      p.ECB.SetECBShape(STATE_IDS.LAND_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var SoftLand = {
    StateName: "SoftLand",
    StateId: STATE_IDS.SOFT_LAND_S,
    OnEnter: (p, w) => {
      p.Flags.FastFallOff();
      p.Jump.ResetJumps();
      p.Velocity.Y = 0;
      p.LedgeDetector.ZeroLedgeGrabCount();
      p.ECB.SetECBShape(STATE_IDS.SOFT_LAND_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var LedgeGrab = {
    StateName: "LedgeGrab",
    StateId: STATE_IDS.LEDGE_GRAB_S,
    OnEnter: (p, w) => {
      p.Flags.FastFallOff();
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
      const ledgeDetectorComp = p.LedgeDetector;
      const jumpComp = p.Jump;
      jumpComp.ResetJumps();
      jumpComp.IncrementJumps();
      ledgeDetectorComp.IncrementLedgeGrabs();
      p.ECB.SetECBShape(STATE_IDS.LEDGE_GRAB_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var AirDodge = {
    StateName: "AirDodge",
    StateId: STATE_IDS.AIR_DODGE_S,
    OnEnter: (p, w) => {
      p.Flags.FastFallOff();
      p.Flags.ZeroDisablePlatDetection();
      const pVel = p.Velocity;
      const ecb = p.ECB;
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const angle = Math.atan2(ia?.LYAxis, ia?.LXAxis);
      const speed = p.Speeds.AirDogeSpeed;
      pVel.X = Math.cos(angle) * speed;
      pVel.Y = -Math.sin(angle) * speed;
      ecb.SetECBShape(STATE_IDS.AIR_DODGE_S);
    },
    OnUpdate: (p, w) => {
      const frameLength = p.FSMInfo.GetFrameLengthForState(
        STATE_IDS.AIR_DODGE_S
      );
      const currentFrameForState = p.FSMInfo.CurrentStateFrame;
      const normalizedTime = Math.min(currentFrameForState / frameLength, 1);
      const ease = EaseIn(normalizedTime);
      const pVel = p.Velocity;
      pVel.X *= 1 - ease;
      pVel.Y *= 1 - ease;
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  var Helpess = {
    StateName: "Helpess",
    StateId: STATE_IDS.HELPESS_S,
    OnEnter: (p, w) => {
      if (p.Jump.OnFirstJump()) {
        p.Jump.IncrementJumps();
      }
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const speeds = p.Speeds;
      const airSpeed = speeds.AerialSpeedInpulseLimit;
      const airMult = speeds.ArielVelocityMultiplier;
      p.Velocity.AddClampedXImpulse(airSpeed, ia.LXAxis * airMult / 2);
    },
    OnExit: (p, w) => {
    }
  };
  var NAttack = {
    StateName: "Attack",
    StateId: STATE_IDS.ATTACK_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.ATTACK_GE);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
      const y = impulse.Y;
      const clamp = attack?.ImpulseClamp;
      const pVel = p.Velocity;
      if (clamp !== void 0) {
        pVel.AddClampedXImpulse(clamp, x);
        pVel.AddClampedYImpulse(clamp, y);
      }
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
    }
  };
  var DashAttack = {
    StateName: "DashAttack",
    StateId: STATE_IDS.DASH_ATTACK_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.DASH_ATTACK_GE);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
      const y = impulse.Y;
      const clamp = attack?.ImpulseClamp;
      const pVel = p.Velocity;
      if (clamp !== void 0) {
        pVel.AddClampedXImpulse(clamp, x);
        pVel.AddClampedYImpulse(clamp, y);
      }
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
    }
  };
  var DownTilt = {
    StateName: "DownTilt",
    StateId: STATE_IDS.DOWN_TILT_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.D_TILT_GE);
      p.ECB.SetECBShape(STATE_IDS.DOWN_TILT_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
      const y = impulse.Y;
      const clamp = attack?.ImpulseClamp;
      const pVel = p.Velocity;
      if (clamp !== void 0) {
        pVel.AddClampedXImpulse(clamp, x);
        pVel.AddClampedYImpulse(clamp, y);
      }
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var SideTilt = {
    StateName: "SideTilt",
    StateId: STATE_IDS.SIDE_TILT_S,
    OnEnter: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      if (ia.LYAxis > 0.15) {
        p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.S_TILT_U_GE);
        p.ECB.SetECBShape(STATE_IDS.SIDE_TILT_S);
        return;
      }
      if (ia.LYAxis < -0.15) {
        p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.S_TILT_D_GE);
        p.ECB.SetECBShape(STATE_IDS.SIDE_TILT_S);
        return;
      }
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.S_TILT_GE);
      p.ECB.SetECBShape(STATE_IDS.SIDE_TILT_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      addAttackImpulseToPlayer(p, impulse, attack);
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var UpTilt = {
    StateName: "UpTilt",
    StateId: STATE_IDS.UP_TILT_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.U_TILT_GE);
      p.ECB.SetECBShape(STATE_IDS.UP_TILT_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      addAttackImpulseToPlayer(p, impulse, attack);
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var SideCharge = {
    StateName: "SideChagrge",
    OnEnter: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const rXAxis = ia.RXAxis;
      if (rXAxis > 0) {
        p.Flags.FaceRight();
      }
      if (rXAxis < 0) {
        p.Flags.FaceLeft();
      }
      const attackComp = p.Attacks;
      attackComp.SetCurrentAttack(GAME_EVENT_IDS.SIDE_CHARGE_GE);
      attackComp.GetAttack().OnEnter(w, p);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    },
    StateId: STATE_IDS.SIDE_CHARGE_S
  };
  var SideChargeEx = {
    StateName: "SideChagrgeEx",
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.SIDE_CHARGE_EX_GE);
      p.ECB.SetECBShape(STATE_IDS.SIDE_CHARGE_EX_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      addAttackImpulseToPlayer(p, impulse, attack);
    },
    OnExit: (p, w) => {
      p.Attacks.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    },
    StateId: STATE_IDS.SIDE_CHARGE_EX_S
  };
  var UpCharge = {
    StateName: "UpCharge",
    OnEnter: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const rXAxis = ia.RXAxis;
      if (rXAxis > 0) {
        p.Flags.FaceRight();
      }
      if (rXAxis < 0) {
        p.Flags.FaceLeft();
      }
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.UP_CHARGE_GE);
      p.ECB.SetECBShape(STATE_IDS.UP_CHARGE_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.Attacks.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    },
    StateId: STATE_IDS.UP_CHARGE_S
  };
  var UpChargeEx = {
    StateName: "UpChargeExt",
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.UP_CHARGE_EX_GE);
      p.ECB.SetECBShape(STATE_IDS.UP_CHARGE_EX_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      addAttackImpulseToPlayer(p, impulse, attack);
    },
    OnExit: (p, w) => {
      p.Attacks.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    },
    StateId: STATE_IDS.UP_CHARGE_EX_S
  };
  var DownCharge = {
    StateName: "DownCharge",
    OnEnter: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const rXAxis = ia.RXAxis;
      if (rXAxis > 0) {
        p.Flags.FaceRight();
      }
      if (rXAxis < 0) {
        p.Flags.FaceLeft();
      }
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.DOWN_CHARGE_GE);
      p.ECB.SetECBShape(STATE_IDS.DOWN_CHARGE_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.Attacks.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    },
    StateId: STATE_IDS.DOWN_CHARGE_S
  };
  var DownChargeEx = {
    StateName: "DownChargeExt",
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.DOWN_CHARGE_EX_GE);
      p.ECB.SetECBShape(STATE_IDS.DOWN_CHARGE_EX_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      addAttackImpulseToPlayer(p, impulse, attack);
    },
    OnExit: (p, w) => {
      p.Attacks.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    },
    StateId: STATE_IDS.DOWN_CHARGE_EX_S
  };
  var NAerialAttack = {
    StateName: "AerialAttack",
    StateId: STATE_IDS.N_AIR_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.N_AIR_GE);
      p.ECB.SetECBShape(STATE_IDS.N_AIR_S);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const speeds = p.Speeds;
      const airSpeed = speeds.AerialSpeedInpulseLimit;
      const airMult = speeds.ArielVelocityMultiplier;
      p.Velocity.AddClampedXImpulse(airSpeed, ia.LXAxis * airMult);
      if (prevIa !== void 0 && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
        p.Flags.FastFallOn();
      }
    },
    OnExit(p, w) {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var FAerialAttack = {
    StateName: "FAir",
    StateId: STATE_IDS.F_AIR_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.F_AIR_GE);
      p.ECB.SetECBShape(STATE_IDS.F_AIR_S);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const speedsComp = p.Speeds;
      p.Velocity.AddClampedXImpulse(
        speedsComp.AerialSpeedInpulseLimit,
        ia.LXAxis * speedsComp.ArielVelocityMultiplier
      );
      if (prevIa !== void 0 && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
        p.Flags.FastFallOn();
      }
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var UAirAttack = {
    StateName: "UAir",
    StateId: STATE_IDS.U_AIR_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.U_AIR_GE);
      p.ECB.SetECBShape(STATE_IDS.U_AIR_S);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const speedsComp = p.Speeds;
      p.Velocity.AddClampedXImpulse(
        speedsComp.AerialSpeedInpulseLimit,
        ia.LXAxis * speedsComp.ArielVelocityMultiplier
      );
      if (prevIa !== void 0 && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
        p.Flags.FastFallOn();
      }
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var BAirAttack = {
    StateName: "BAir",
    StateId: STATE_IDS.B_AIR_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.B_AIR_GE);
      p.ECB.SetECBShape(STATE_IDS.B_AIR_S);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const speedsComp = p.Speeds;
      p.Velocity.AddClampedXImpulse(
        speedsComp.AerialSpeedInpulseLimit,
        ia.LXAxis * speedsComp.ArielVelocityMultiplier
      );
      if (prevIa !== void 0 && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
        p.Flags.FastFallOn();
      }
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var DAirAttack = {
    StateName: "DAir",
    StateId: STATE_IDS.D_AIR_S,
    OnEnter: (p, w) => {
      p.Attacks.SetCurrentAttack(GAME_EVENT_IDS.D_AIR_GE);
      p.ECB.SetECBShape(STATE_IDS.D_AIR_S);
    },
    OnUpdate: (p, w) => {
      const inputStore = w.PlayerData.InputStore(p.ID);
      const curFrame = w.localFrame;
      const prevFrame = w.PreviousFrame;
      const ia = inputStore.GetInputForFrame(curFrame);
      const prevIa = inputStore.GetInputForFrame(prevFrame);
      const speedsComp = p.Speeds;
      p.Velocity.AddClampedXImpulse(
        speedsComp.AerialSpeedInpulseLimit,
        ia.LXAxis * speedsComp.ArielVelocityMultiplier
      );
      if (prevIa !== void 0 && ShouldFastFall(ia.LYAxis, prevIa.LYAxis)) {
        p.Flags.FastFallOn();
      }
    },
    OnExit: (p, w) => {
      p.Attacks.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var SideSpecial = {
    StateName: "SideSpecial",
    StateId: STATE_IDS.SIDE_SPCL_S,
    OnEnter: (p, w) => {
      const curFrame = w.localFrame;
      const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
      const lxAxis = ia.LXAxis;
      if (lxAxis < 0) {
        p.Flags.FaceLeft();
      }
      if (lxAxis >= 0) {
        p.Flags.FaceRight();
      }
      const attackComp = p.Attacks;
      attackComp.SetCurrentAttack(GAME_EVENT_IDS.SIDE_SPCL_GE);
      const atk = attackComp.GetAttack();
      atk.OnEnter(w, p);
    },
    OnUpdate: (p, w) => {
      const attack = p.Attacks.GetAttack();
      const currentStateFrame = p.FSMInfo.CurrentStateFrame;
      const impulse = attack.GetActiveImpulseForFrame(currentStateFrame);
      if (impulse !== void 0) {
        addAttackImpulseToPlayer(p, impulse, attack);
      }
      attack.OnUpdate(w, p, currentStateFrame);
    },
    OnExit: (p, w) => {
      const atkComp = p.Attacks;
      const atk = atkComp.GetAttack();
      atk.OnExit(w, p);
      atkComp.ZeroCurrentAttack();
    }
  };
  var SideSpecialExtension = {
    StateName: "SideSpecialExtension",
    StateId: STATE_IDS.SIDE_SPCL_EX_S,
    OnEnter: (p, w) => {
      const atkComp = p.Attacks;
      atkComp.SetCurrentAttack(GAME_EVENT_IDS.SIDE_SPCL_EX_GE);
      atkComp.GetAttack().OnEnter(w, p);
    },
    OnUpdate: (p, world) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      attack.OnUpdate(world, p, world.localFrame);
    },
    OnExit: (p, w) => {
      const atkComp = p.Attacks;
      atkComp.GetAttack().OnExit(w, p);
      atkComp.ZeroCurrentAttack();
    }
  };
  var SideSpecialAir = {
    StateName: "SideSpecialAir",
    StateId: STATE_IDS.SIDE_SPCL_AIR_S,
    OnEnter: (p, w) => {
      const curFrame = w.localFrame;
      const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
      const lxAxis = ia.LXAxis;
      if (lxAxis < 0) {
        p.Flags.FaceLeft();
      }
      if (lxAxis >= 0) {
        p.Flags.FaceRight();
      }
      const attackComp = p.Attacks;
      attackComp.SetCurrentAttack(GAME_EVENT_IDS.S_SPCL_AIR_GE);
      const atk = attackComp.GetAttack();
      atk.OnEnter(w, p);
    },
    OnUpdate: (p, w) => {
      const attack = p.Attacks.GetAttack();
      const currentStateFrame = p.FSMInfo.CurrentStateFrame;
      const impulse = attack.GetActiveImpulseForFrame(currentStateFrame);
      if (impulse !== void 0) {
        addAttackImpulseToPlayer(p, impulse, attack);
      }
      attack.OnUpdate(w, p, currentStateFrame);
    },
    OnExit: (p, w) => {
      const atkComp = p.Attacks;
      const atk = atkComp.GetAttack();
      atk.OnExit(w, p);
      atkComp.ZeroCurrentAttack();
    }
  };
  var SideSpecialExtensionAir = {
    StateName: "SideSpecialExtensionAir",
    StateId: STATE_IDS.SIDE_SPCL_EX_AIR_S,
    OnEnter: (p, w) => {
      const atkComp = p.Attacks;
      atkComp.SetCurrentAttack(GAME_EVENT_IDS.S_SPCL_EX_AIR_GE);
      atkComp.GetAttack().OnEnter(w, p);
    },
    OnUpdate: (p, world) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      attack.OnUpdate(world, p, world.localFrame);
    },
    OnExit: (p, w) => {
      const atkComp = p.Attacks;
      atkComp.GetAttack().OnExit(w, p);
      atkComp.ZeroCurrentAttack();
    }
  };
  var DownSpecial = {
    StateName: "DownSpecial",
    StateId: STATE_IDS.DOWN_SPCL_S,
    OnEnter: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.SetCurrentAttack(GAME_EVENT_IDS.DOWN_SPCL_GE);
      p.ECB.SetECBShape(STATE_IDS.DOWN_SPCL_S);
    },
    OnUpdate: (p, w) => {
      const attackComp = p.Attacks;
      const attack = attackComp.GetAttack();
      const impulse = attack?.GetActiveImpulseForFrame(
        p.FSMInfo.CurrentStateFrame
      );
      if (impulse === void 0) {
        return;
      }
      addAttackImpulseToPlayer(p, impulse, attack);
    },
    OnExit: (p, w) => {
      const attackComp = p.Attacks;
      attackComp.ZeroCurrentAttack();
      p.ECB.ResetECBShape();
    }
  };
  var HitStop = {
    StateName: "HitStop",
    StateId: STATE_IDS.HIT_STOP_S,
    OnEnter: (p, world) => {
      p.Flags.FastFallOff();
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    },
    OnUpdate: (p, world) => {
      p.HitStop.Decrement();
    },
    OnExit: (p, world) => {
      p.HitStop.SetZero();
    }
  };
  var Launch = {
    StateName: "Launch",
    StateId: STATE_IDS.LAUNCH_S,
    OnEnter: (p, w) => {
      const pVel = p.Velocity;
      const hitStun = p.HitStun;
      pVel.X = hitStun.VX;
      pVel.Y = hitStun.VY;
      if (p.Jump.OnFirstJump()) {
        p.Jump.IncrementJumps();
      }
    },
    OnUpdate: (p, w) => {
      p.HitStun.DecrementHitStun();
    },
    OnExit: (p, w) => {
      p.HitStun.Zero();
    }
  };
  var Tumble = {
    StateName: "Tumble",
    StateId: STATE_IDS.TUMBLE_S,
    OnEnter: (p, w) => {
      p.Jump.ResetJumps();
      p.Jump.IncrementJumps();
    },
    OnUpdate: (p, w) => {
      const curFrame = w.localFrame;
      const ia = w.PlayerData.InputStore(p.ID).GetInputForFrame(curFrame);
      const speeds = p.Speeds;
      const airSpeed = speeds.AerialSpeedInpulseLimit;
      const airMult = speeds.ArielVelocityMultiplier;
      p.Velocity.AddClampedXImpulse(airSpeed, ia.LXAxis * airMult / 2);
    },
    OnExit: (p, w) => {
    }
  };
  var Crouch = {
    StateName: "Crouch",
    StateId: STATE_IDS.CROUCH_S,
    OnEnter: (p, w) => {
      p.ECB.SetECBShape(STATE_IDS.CROUCH_S);
    },
    OnUpdate: (p, w) => {
    },
    OnExit: (p, w) => {
      p.ECB.ResetECBShape();
    }
  };
  function ShouldFastFall(curLYAxsis, prevLYAxsis) {
    return curLYAxsis < -0.8 && prevLYAxsis > -0.8;
  }
  function inputMacthesTargetNotRepeating(targetGeId, ia, prevIa) {
    if (ia.Action !== targetGeId) {
      return false;
    }
    if (prevIa === void 0) {
      return true;
    }
    if (ia.Action === prevIa.Action) {
      return false;
    }
    return true;
  }
  function isBufferedInput(inputStore, currentFrame, bufferFrames, targetGameEvent) {
    for (let i = 0; i < bufferFrames; i++) {
      const ia = inputStore.GetInputForFrame(currentFrame - i);
      if (!ia) continue;
      if (ia.Action === targetGameEvent) {
        const prevIa = inputStore.GetInputForFrame(currentFrame - i - 1);
        if (prevIa.Action !== targetGameEvent) {
          return true;
        }
      }
    }
    return false;
  }
  function addAttackImpulseToPlayer(p, impulse, attack) {
    const x = p.Flags.IsFacingRight ? impulse.X : -impulse.X;
    const y = impulse.Y;
    const clamp = attack?.ImpulseClamp;
    const pVel = p.Velocity;
    if (clamp !== void 0) {
      pVel.AddClampedXImpulse(clamp, x);
      pVel.AddClampedYImpulse(clamp, y);
    }
  }
  var IDLE_STATE_RELATIONS = InitIdleRelations();
  var TURN_RELATIONS = InitTurnRelations();
  var WALK_RELATIONS = InitWalkRelations();
  var DASH_RELATIONS = InitDashRelations();
  var DASH_TURN_RELATIONS = InitDashTurnRelations();
  var RUN_RELATIONS = InitRunRelations();
  var RUN_TURN_RELATIONS = InitRunTurnRelations();
  var STOP_RUN_RELATIONS = InitStopRunRelations();
  var JUMP_SQUAT_RELATIONS = InitJumpSquatRelations();
  var JUMP_RELATIONS = InitJumpRelations();
  var NFALL_RELATIONS = InitNeutralFallRelations();
  var LAND_RELATIONS = InitLandRelations();
  var SOFT_LAND_RELATIONS = InitSoftLandRelations();
  var LEDGE_GRAB_RELATIONS = InitLedgeGrabRelations();
  var AIR_DODGE_RELATIONS = InitAirDodgeRelations();
  var HELPESS_RELATIONS = InitHelpessRelations();
  var ATTACK_RELATIONS = InitAttackRelations();
  var SIDE_CHARGE_RELATIONS = InitSideChargeRelations();
  var SIDE_CHARGE_EX_RELATIONS = InitSideChargeExRelations();
  var DOWN_TILT_RELATIONS = InitDownTiltRelations();
  var UP_TILT_RELATIONS = InitUpTiltRelations();
  var SIDE_TILT_RELATIONS = InitSideTiltRelations();
  var DASH_ATK_RELATIONS = InitDashAttackRelations();
  var AIR_ATK_RELATIONS = InitAirAttackRelations();
  var F_AIR_ATK_RELATIONS = InitFAirAttackRelations();
  var U_AIR_ATK_RELATIONS = InitUAirRelations();
  var B_AIR_ATK_RELATIONS = InitBAirRelations();
  var D_AIR_ATK_RELATIONS = InitDAirRelations();
  var SIDE_SPCL_RELATIONS = InitSideSpecialRelations();
  var SIDE_SPCL_EX_RELATIONS = InitSideSpecialExtensionRelations();
  var SIDE_SPCL_AIR_RELATIONS = InitSideSpecialAirRelations();
  var SIDE_SPCL_AIR_EX_RELATIONS = InitSideSpecialExAirRelations();
  var DOWN_SPECIAL_RELATIONS = InitDownSpecialRelations();
  var HIT_STOP_RELATIONS = InitHitStopRelations();
  var TUMBLE_RELATIONS = InitTumbleRelations();
  var LAUNCH_RELATIONS = InitLaunchRelations();
  var CROUCH_RELATIONS = InitCrouchRelations();
  var UP_CHARGE_RELATIONS = InitUpChargeRelations();
  var UP_CHARGE_EX_RELATIONS = InitiUpChargeExRelations();
  var DOWN_CHARGE_RELATIONS = InitDownChargeRelations();
  var DOWN_CHARGE_EX_RELATIONS = InitDownChargeExRelations();
  var ActionMappings = (/* @__PURE__ */ new Map()).set(IDLE_STATE_RELATIONS.stateId, IDLE_STATE_RELATIONS.mappings).set(TURN_RELATIONS.stateId, TURN_RELATIONS.mappings).set(WALK_RELATIONS.stateId, WALK_RELATIONS.mappings).set(DASH_RELATIONS.stateId, DASH_RELATIONS.mappings).set(DASH_TURN_RELATIONS.stateId, DASH_TURN_RELATIONS.mappings).set(RUN_RELATIONS.stateId, RUN_RELATIONS.mappings).set(RUN_TURN_RELATIONS.stateId, RUN_TURN_RELATIONS.mappings).set(STOP_RUN_RELATIONS.stateId, STOP_RUN_RELATIONS.mappings).set(JUMP_SQUAT_RELATIONS.stateId, JUMP_SQUAT_RELATIONS.mappings).set(JUMP_RELATIONS.stateId, JUMP_RELATIONS.mappings).set(NFALL_RELATIONS.stateId, NFALL_RELATIONS.mappings).set(LAND_RELATIONS.stateId, LAND_RELATIONS.mappings).set(SOFT_LAND_RELATIONS.stateId, SOFT_LAND_RELATIONS.mappings).set(LEDGE_GRAB_RELATIONS.stateId, LEDGE_GRAB_RELATIONS.mappings).set(AIR_DODGE_RELATIONS.stateId, AIR_DODGE_RELATIONS.mappings).set(HELPESS_RELATIONS.stateId, HELPESS_RELATIONS.mappings).set(ATTACK_RELATIONS.stateId, ATTACK_RELATIONS.mappings).set(SIDE_CHARGE_RELATIONS.stateId, SIDE_CHARGE_RELATIONS.mappings).set(SIDE_CHARGE_EX_RELATIONS.stateId, SIDE_CHARGE_EX_RELATIONS.mappings).set(UP_CHARGE_RELATIONS.stateId, UP_CHARGE_RELATIONS.mappings).set(UP_CHARGE_EX_RELATIONS.stateId, UP_CHARGE_EX_RELATIONS.mappings).set(DOWN_CHARGE_RELATIONS.stateId, DOWN_CHARGE_RELATIONS.mappings).set(DOWN_CHARGE_EX_RELATIONS.stateId, DOWN_CHARGE_EX_RELATIONS.mappings).set(DOWN_TILT_RELATIONS.stateId, DOWN_TILT_RELATIONS.mappings).set(UP_TILT_RELATIONS.stateId, UP_TILT_RELATIONS.mappings).set(SIDE_TILT_RELATIONS.stateId, SIDE_TILT_RELATIONS.mappings).set(DASH_ATK_RELATIONS.stateId, DASH_ATK_RELATIONS.mappings).set(AIR_ATK_RELATIONS.stateId, AIR_ATK_RELATIONS.mappings).set(F_AIR_ATK_RELATIONS.stateId, F_AIR_ATK_RELATIONS.mappings).set(U_AIR_ATK_RELATIONS.stateId, U_AIR_ATK_RELATIONS.mappings).set(B_AIR_ATK_RELATIONS.stateId, B_AIR_ATK_RELATIONS.mappings).set(D_AIR_ATK_RELATIONS.stateId, D_AIR_ATK_RELATIONS.mappings).set(DOWN_SPECIAL_RELATIONS.stateId, DOWN_SPECIAL_RELATIONS.mappings).set(SIDE_SPCL_RELATIONS.stateId, SIDE_SPCL_RELATIONS.mappings).set(SIDE_SPCL_EX_RELATIONS.stateId, SIDE_SPCL_EX_RELATIONS.mappings).set(SIDE_SPCL_AIR_RELATIONS.stateId, SIDE_SPCL_AIR_RELATIONS.mappings).set(SIDE_SPCL_AIR_EX_RELATIONS.stateId, SIDE_SPCL_AIR_EX_RELATIONS.mappings).set(HIT_STOP_RELATIONS.stateId, HIT_STOP_RELATIONS.mappings).set(TUMBLE_RELATIONS.stateId, TUMBLE_RELATIONS.mappings).set(LAUNCH_RELATIONS.stateId, LAUNCH_RELATIONS.mappings).set(CROUCH_RELATIONS.stateId, CROUCH_RELATIONS.mappings);
  var FSMStates = (/* @__PURE__ */ new Map()).set(Idle.StateId, Idle).set(Turn.StateId, Turn).set(Walk.StateId, Walk).set(Run.StateId, Run).set(RunTurn.StateId, RunTurn).set(RunStop.StateId, RunStop).set(Dash.StateId, Dash).set(DashTurn.StateId, DashTurn).set(JumpSquat.StateId, JumpSquat).set(Jump.StateId, Jump).set(NeutralFall.StateId, NeutralFall).set(Land.StateId, Land).set(SoftLand.StateId, SoftLand).set(LedgeGrab.StateId, LedgeGrab).set(AirDodge.StateId, AirDodge).set(Helpess.StateId, Helpess).set(NAttack.StateId, NAttack).set(SideCharge.StateId, SideCharge).set(SideChargeEx.StateId, SideChargeEx).set(SideTilt.StateId, SideTilt).set(UpCharge.StateId, UpCharge).set(UpChargeEx.StateId, UpChargeEx).set(DownCharge.StateId, DownCharge).set(DownChargeEx.StateId, DownChargeEx).set(DashAttack.StateId, DashAttack).set(NAerialAttack.StateId, NAerialAttack).set(FAerialAttack.StateId, FAerialAttack).set(UAirAttack.StateId, UAirAttack).set(BAirAttack.StateId, BAirAttack).set(DAirAttack.StateId, DAirAttack).set(SideSpecial.StateId, SideSpecial).set(SideSpecialExtension.StateId, SideSpecialExtension).set(SideSpecialAir.StateId, SideSpecialAir).set(SideSpecialExtensionAir.StateId, SideSpecialExtensionAir).set(DownSpecial.StateId, DownSpecial).set(HitStop.StateId, HitStop).set(Tumble.StateId, Tumble).set(Launch.StateId, Launch).set(Crouch.StateId, Crouch).set(DownTilt.StateId, DownTilt).set(UpTilt.StateId, UpTilt);
  var AttackGameEventMappings = (/* @__PURE__ */ new Map()).set(GAME_EVENT_IDS.ATTACK_GE, ATTACK_IDS.N_GRND_ATK).set(GAME_EVENT_IDS.SIDE_CHARGE_GE, ATTACK_IDS.S_CHARGE_ATK).set(GAME_EVENT_IDS.SIDE_CHARGE_EX_GE, ATTACK_IDS.S_CHARGE_EX_ATK).set(GAME_EVENT_IDS.UP_CHARGE_GE, ATTACK_IDS.U_CHARGE_ATK).set(GAME_EVENT_IDS.UP_CHARGE_EX_GE, ATTACK_IDS.U_CHARGE_EX_ATK).set(GAME_EVENT_IDS.DOWN_CHARGE_GE, ATTACK_IDS.D_CHARGE_ATK).set(GAME_EVENT_IDS.DOWN_CHARGE_EX_GE, ATTACK_IDS.D_CHARGE_EX_ATK).set(GAME_EVENT_IDS.DASH_ATTACK_GE, ATTACK_IDS.DASH_ATK).set(GAME_EVENT_IDS.D_TILT_GE, ATTACK_IDS.D_TILT_ATK).set(GAME_EVENT_IDS.S_TILT_GE, ATTACK_IDS.S_TILT_ATK).set(GAME_EVENT_IDS.S_TILT_U_GE, ATTACK_IDS.S_TILT_U_ATK).set(GAME_EVENT_IDS.S_TILT_D_GE, ATTACK_IDS.S_TITL_D_ATK).set(GAME_EVENT_IDS.U_TILT_GE, ATTACK_IDS.U_TILT_ATK).set(GAME_EVENT_IDS.N_AIR_GE, ATTACK_IDS.N_AIR_ATK).set(GAME_EVENT_IDS.F_AIR_GE, ATTACK_IDS.F_AIR_ATK).set(GAME_EVENT_IDS.U_AIR_GE, ATTACK_IDS.U_AIR_ATK).set(GAME_EVENT_IDS.B_AIR_GE, ATTACK_IDS.B_AIR_ATK).set(GAME_EVENT_IDS.D_AIR_GE, ATTACK_IDS.D_AIR_ATK).set(GAME_EVENT_IDS.SIDE_SPCL_GE, ATTACK_IDS.S_SPCL_ATK).set(GAME_EVENT_IDS.SIDE_SPCL_EX_GE, ATTACK_IDS.S_SPCL_EX_ATK).set(GAME_EVENT_IDS.S_SPCL_AIR_GE, ATTACK_IDS.S_SPCL_AIR_ATK).set(GAME_EVENT_IDS.S_SPCL_EX_AIR_GE, ATTACK_IDS.S_SPCL_EX_AIR_ATK).set(GAME_EVENT_IDS.DOWN_SPCL_GE, ATTACK_IDS.D_SPCL_ATK);

  // game/engine/physics/collisions.ts
  function IntersectsPolygons(verticiesA, verticiesB, vecPool, colResPool, projResPool) {
    let normal = vecPool.Rent();
    let depth = Number.MAX_SAFE_INTEGER;
    const verticiesAVec = vecPool.Rent();
    const verticiesBVec = vecPool.Rent();
    for (let i = 0; i < verticiesA.length; i++) {
      const va = verticiesA[i];
      const vb = verticiesA[(i + 1) % verticiesA.length];
      verticiesAVec.SetXY(va.X, va.Y);
      verticiesBVec.SetXY(vb.X, vb.Y);
      let axis = verticiesBVec.SubtractVec(verticiesAVec).SetY(-verticiesBVec.Y).Normalize();
      const vaProj = projectVerticies(verticiesA, axis, vecPool, projResPool);
      const vbProj = projectVerticies(verticiesB, axis, vecPool, projResPool);
      if (vaProj.Min >= vbProj.Max || vbProj.Min >= vaProj.Max) {
        return colResPool.Rent();
      }
      const axisDepth = Math.min(
        vbProj.Max - vaProj.Min,
        vaProj.Max - vbProj.Min
      );
      if (axisDepth < depth) {
        depth = axisDepth;
        normal.SetX(axis.X).SetY(axis.Y);
      }
    }
    verticiesAVec.Zero();
    verticiesBVec.Zero();
    for (let i = 0; i < verticiesB.length; i++) {
      const va = verticiesB[i];
      const vb = verticiesB[(i + 1) % verticiesB.length];
      verticiesAVec.SetXY(va.X, va.Y);
      verticiesBVec.SetXY(vb.X, vb.Y);
      const axis = verticiesBVec.SubtractVec(verticiesAVec).SetY(-verticiesBVec.Y).Normalize();
      const vaProj = projectVerticies(verticiesA, axis, vecPool, projResPool);
      const vbProj = projectVerticies(verticiesB, axis, vecPool, projResPool);
      if (vaProj.Min >= vbProj.Max || vbProj.Min >= vaProj.Max) {
        return colResPool.Rent();
      }
      const axisDepth = Math.min(
        vbProj.Max - vaProj.Min,
        vaProj.Max - vbProj.Min
      );
      if (axisDepth < depth) {
        depth = axisDepth;
        normal.SetX(axis.X).SetY(axis.Y);
      }
    }
    const centerA = FindArithemticMean(verticiesA, vecPool.Rent());
    const centerB = FindArithemticMean(verticiesB, vecPool.Rent());
    const direction = centerB.SubtractVec(centerA);
    if (direction.DotProduct(normal) < 0) {
      normal.Negate();
    }
    const res = colResPool.Rent();
    res.SetCollisionTrue(normal.X, normal.Y, depth);
    return res;
  }
  function IntersectsCircles(colResPool, v1, v2, r1, r2) {
    let dist = v1.Distance(v2);
    let raddi = r1 + r2;
    if (dist > raddi) {
      return colResPool.Rent();
    }
    const norm = v2.SubtractVec(v1).Normalize();
    const depth = raddi - dist;
    const returnValue = colResPool.Rent();
    returnValue.SetCollisionTrue(norm.X, norm.Y, depth);
    return returnValue;
  }
  function ClosestPointsBetweenSegments(p1, q1, p2, q2, vecPool, ClosestPointsPool) {
    const isSegment1Point = p1.X === q1.X && p1.Y === q1.Y;
    const isSegment2Point = p2.X === q2.X && p2.Y === q2.Y;
    if (isSegment1Point && isSegment2Point) {
      const ret = ClosestPointsPool.Rent();
      ret.Set(p1.X, p1.Y, p2.X, p2.Y);
      return ret;
    }
    if (isSegment1Point) {
      return closestPointOnSegmentToPoint(p2, q2, p1, vecPool, ClosestPointsPool);
    }
    if (isSegment2Point) {
      return closestPointOnSegmentToPoint(p1, q1, p2, vecPool, ClosestPointsPool);
    }
    const p1Dto = vecPool.Rent().SetXY(p1.X, p1.Y);
    const p2Dto = vecPool.Rent().SetXY(p2.X, p2.Y);
    const d1 = q1.SubtractVec(p1Dto);
    const d2 = q2.SubtractVec(p2Dto);
    const r = p1Dto.SubtractVec(p2Dto);
    const a = d1.DotProduct(d1);
    const e = d2.DotProduct(d2);
    const f = d2.DotProduct(r);
    let s = 0;
    let t = 0;
    const b = d1.DotProduct(d2);
    const c = d1.DotProduct(r);
    const denom = a * e - b * b;
    if (Math.abs(denom) > Number.EPSILON) {
      s = ClampWithMin((b * f - c * e) / denom, 0, 1);
    } else {
      s = 0;
    }
    t = (b * s + f) / e;
    if (t < 0) {
      t = 0;
      s = ClampWithMin(-c / a, 0, 1);
    } else if (t > 1) {
      t = 1;
      s = ClampWithMin((b - c) / a, 0, 1);
    }
    let c1X = p1.X + s * d1.X;
    let c1Y = p1.Y + s * d1.Y;
    let c2X = p2Dto.X + t * d2.X;
    let c2Y = p2Dto.Y + t * d2.Y;
    const closestPoints = ClosestPointsPool.Rent();
    closestPoints.Set(c1X, c1Y, c2X, c2Y);
    return closestPoints;
  }
  function FindArithemticMean(verticies, pooledVec) {
    let sumX = 0;
    let sumY = 0;
    const vertLength = verticies.length;
    for (let index = 0; index < vertLength; index++) {
      const v = verticies[index];
      sumX += v.X;
      sumY += v.Y;
    }
    return pooledVec.SetXY(sumX, sumY).Divide(vertLength);
  }
  function closestPointOnSegmentToPoint(segStart, segEnd, point, vecPool, ClosestPointsPool) {
    const segVec = vecPool.Rent().SetXY(segEnd.X - segStart.X, segEnd.Y - segStart.Y);
    const pointVec = vecPool.Rent().SetXY(point.X - segStart.X, point.Y - segStart.Y);
    const segLengthSquared = segVec.X * segVec.X + segVec.Y * segVec.Y;
    let t = 0;
    if (segLengthSquared > 0) {
      t = (pointVec.X * segVec.X + pointVec.Y * segVec.Y) / segLengthSquared;
      t = Math.max(0, Math.min(1, t));
    }
    const closestX = segStart.X + t * segVec.X;
    const closestY = segStart.Y + t * segVec.Y;
    const ret = ClosestPointsPool.Rent();
    ret.Set(closestX, closestY, point.X, point.Y);
    return ret;
  }
  function projectVerticies(verticies, axis, vecPool, projResPool) {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    const vRes = vecPool.Rent();
    for (let i = 0; i < verticies.length; i++) {
      const v = verticies[i];
      vRes.SetXY(v.X, v.Y);
      const projection = vRes.DotProduct(axis);
      if (projection < min) {
        min = projection;
      }
      if (projection > max) {
        max = projection;
      }
    }
    let result = projResPool.Rent();
    result.SetMinMax(min, max);
    return result;
  }
  function LineSegmentIntersection(ax1, ay1, ax2, ay2, bx3, by3, bx4, by4) {
    const denom = (by4 - by3) * (ax2 - ax1) - (bx4 - bx3) * (ay2 - ay1);
    const numeA = (bx4 - bx3) * (ay1 - by3) - (by4 - by3) * (ax1 - bx3);
    const numeB = (ax2 - ax1) * (ay1 - by3) - (ay2 - ay1) * (ax1 - bx3);
    if (denom === 0) {
      return false;
    }
    const uA = numeA / denom;
    const uB = numeB / denom;
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
      return true;
    }
    return false;
  }
  function cross(o, a, b) {
    return (a.X - o.X) * (b.Y - o.Y) - (a.Y - o.Y) * (b.X - o.X);
  }
  function comparePointsXY(a, b) {
    if (a.X === b.X) {
      return a.Y - b.Y;
    }
    return a.X - b.X;
  }
  var lower = [];
  var upper = [];
  function CreateConvexHull(points) {
    if (points.length < 3) {
      lower.length = 0;
      for (let i = 0; i < points.length; i++) {
        lower.push(points[i]);
      }
      return lower;
    }
    points.sort(comparePointsXY);
    lower.length = 0;
    upper.length = 0;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const p = points[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    lower.pop();
    upper.pop();
    for (let i = 0; i < upper.length; i++) {
      lower.push(upper[i]);
    }
    return lower;
  }

  // game/engine/player/playerComponents.ts
  var StaticHistory = class {
    ledgDetecorHeight = 0;
    LedgeDetectorWidth = 0;
    HurtCapsules = [];
  };
  var ComponentHistory = class {
    StaticPlayerHistory = new StaticHistory();
    PositionHistory = [];
    FsmInfoHistory = [];
    PlayerPointsHistory = [];
    PlayerHitStunHistory = [];
    PlayerHitStopHistory = [];
    VelocityHistory = [];
    FlagsHistory = [];
    EcbHistory = [];
    JumpHistroy = [];
    LedgeDetectorHistory = [];
    SensorsHistory = [];
    AttackHistory = [];
    SetPlayerToFrame(p, frameNumber) {
      p.Position.SetFromSnapShot(this.PositionHistory[frameNumber]);
      p.FSMInfo.SetFromSnapShot(this.FsmInfoHistory[frameNumber]);
      p.Velocity.SetFromSnapShot(this.VelocityHistory[frameNumber]);
      p.Points.SetFromSnapShot(this.PlayerPointsHistory[frameNumber]);
      p.HitStop.SetFromSnapShot(this.PlayerHitStopHistory[frameNumber]);
      p.HitStun.SetFromSnapShot(this.PlayerHitStunHistory[frameNumber]);
      p.Flags.SetFromSnapShot(this.FlagsHistory[frameNumber]);
      p.ECB.SetFromSnapShot(this.EcbHistory[frameNumber]);
      p.LedgeDetector.SetFromSnapShot(this.LedgeDetectorHistory[frameNumber]);
      p.Sensors.SetFromSnapShot(this.SensorsHistory[frameNumber]);
      p.Jump.SetFromSnapShot(this.JumpHistroy[frameNumber]);
      p.Attacks.SetFromSnapShot(this.AttackHistory[frameNumber]);
    }
    static GetRightXFromEcbHistory(ecb) {
      return ecb.posX + ecb.Width / 2;
    }
    static GetRightYFromEcbHistory(ecb) {
      return ecb.posY - ecb.Height / 2;
    }
    static GetLeftXFromEcbHistory(ecb) {
      return ecb.posX - ecb.Width / 2;
    }
    static GetLeftYFromEcbHistory(ecb) {
      return ecb.posY - ecb.Height / 2;
    }
    static GetTopXFromEcbHistory(ecb) {
      return ecb.posX;
    }
    static GetTopYFromEcbHistory(ecb) {
      return ecb.posY - ecb.Height;
    }
    static GetBottomXFromEcbHistory(ecb) {
      return ecb.posX;
    }
    static GetBottomYFromEcbHistory(ecb) {
      return ecb.posY;
    }
    static GetPrevRightXFromEcbHistory(ecb) {
      return ecb.prevPosX + ecb.Width / 2;
    }
    static GetPrevRightYFromEcbHistory(ecb) {
      return ecb.prevPosY - ecb.Height / 2;
    }
    static GetPrevLeftXFromEcbHistory(ecb) {
      return ecb.prevPosX - ecb.Width / 2;
    }
    static GetPrevLeftYFromEcbHistory(ecb) {
      return ecb.prevPosY - ecb.Height / 2;
    }
    static GetPrevTopXFromEcbHistory(ecb) {
      return ecb.prevPosX;
    }
    static GetPrevTopYFromEcbHistory(ecb) {
      return ecb.prevPosY - ecb.Height;
    }
    static GetPrevBottomXFromEcbHistory(ecb) {
      return ecb.prevPosX;
    }
    static GetPrevBottomYFromEcbHistory(ecb) {
      return ecb.prevPosY;
    }
  };
  var PositionComponent = class {
    x;
    y;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    get X() {
      return this.x;
    }
    get Y() {
      return this.y;
    }
    set X(val) {
      this.x = val;
    }
    set Y(val) {
      this.y = val;
    }
    SnapShot() {
      return new FlatVec(this.x, this.y);
    }
    SetFromSnapShot(snapShot) {
      this.x = snapShot.X;
      this.y = snapShot.Y;
    }
  };
  var WeightComponent = class {
    Weight;
    constructor(weight) {
      this.Weight = weight;
    }
  };
  var VelocityComponent = class {
    x;
    y;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    AddClampedXImpulse(clamp, x) {
      const upperBound = Math.abs(clamp);
      const vel = this.x;
      if (Math.abs(vel) > upperBound) {
        return;
      }
      this.x = Clamp(vel + x, upperBound);
    }
    AddClampedYImpulse(clamp, y) {
      const upperBound = Math.abs(clamp);
      const vel = this.y;
      if (Math.abs(vel) > clamp) {
        return;
      }
      this.y = Clamp(vel + y, upperBound);
    }
    SnapShot() {
      return new FlatVec(this.x, this.y);
    }
    SetFromSnapShot(snapShot) {
      this.x = snapShot.X;
      this.y = snapShot.Y;
    }
    get X() {
      return this.x;
    }
    get Y() {
      return this.y;
    }
    set X(val) {
      this.x = val;
    }
    set Y(val) {
      this.y = val;
    }
  };
  var FSMInfoComponent = class {
    currentState = Idle;
    currentStateId = STATE_IDS.IDLE_S;
    currentStateFrame = 0;
    frameLengths;
    constructor(frameLengths) {
      this.frameLengths = frameLengths;
    }
    get CurrentStateFrame() {
      return this.currentStateFrame;
    }
    get CurrentState() {
      return this.currentState;
    }
    get CurrentStatetId() {
      return this.currentStateId;
    }
    SetCurrentState(s) {
      this.currentState = s;
      this.currentStateId = s.StateId;
    }
    IncrementStateFrame() {
      this.currentStateFrame++;
    }
    SetStateFrameToZero() {
      this.currentStateFrame = 0;
    }
    GetFrameLengthForState(stateId) {
      return this.frameLengths.get(stateId);
    }
    GetCurrentStateFrameLength() {
      return this.frameLengths.get(this.currentStateId);
    }
    SetFrameLength(stateId, frameLength) {
      this.frameLengths.set(stateId, frameLength);
    }
    SnapShot() {
      return {
        State: this.currentState,
        StateFrame: this.currentStateFrame,
        frameLengths: new Map(this.frameLengths)
      };
    }
    SetFromSnapShot(snapShot) {
      this.currentState = snapShot.State;
      this.currentStateFrame = snapShot.StateFrame;
      for (const [key, value] of snapShot.frameLengths.entries()) {
        this.frameLengths.set(key, value);
      }
    }
  };
  var HitStopComponent = class {
    hitStopFrames = 0;
    SetHitStop(frames) {
      this.hitStopFrames = frames;
    }
    Decrement() {
      this.hitStopFrames--;
    }
    SetZero() {
      this.hitStopFrames = 0;
    }
    get HitStopFrames() {
      return this.hitStopFrames;
    }
    SnapShot() {
      return this.hitStopFrames;
    }
    SetFromSnapShot(snapShot) {
      this.hitStopFrames = snapShot;
    }
  };
  var HitStunComponent = class {
    framesOfHitStun = 0;
    xVelocity = 0;
    yVelocity = 0;
    set FramesOfHitStun(hitStunFrames) {
      this.framesOfHitStun = hitStunFrames;
    }
    get VX() {
      return this.xVelocity;
    }
    get VY() {
      return this.yVelocity;
    }
    SetHitStun(hitStunFrames, vx, vy) {
      this.framesOfHitStun = hitStunFrames;
      this.xVelocity = vx;
      this.yVelocity = vy;
    }
    DecrementHitStun() {
      this.framesOfHitStun--;
    }
    Zero() {
      this.framesOfHitStun = 0;
      this.xVelocity = 0;
      this.yVelocity = 0;
    }
    SnapShot() {
      return {
        hitStunFrames: this.framesOfHitStun,
        vx: this.xVelocity,
        vy: this.yVelocity
      };
    }
    SetFromSnapShot(snapShot) {
      this.framesOfHitStun = snapShot.hitStunFrames;
      this.xVelocity = snapShot.vx;
      this.yVelocity = snapShot.vy;
    }
  };
  var SpeedsComponent = class {
    GroundedVelocityDecay;
    AerialVelocityDecay;
    AirDogeSpeed;
    ArielVelocityMultiplier;
    AerialSpeedInpulseLimit;
    MaxWalkSpeed;
    MaxRunSpeed;
    WalkSpeedMulitplier;
    RunSpeedMultiplier;
    FastFallSpeed;
    FallSpeed;
    Gravity;
    DashMultiplier;
    MaxDashSpeed;
    // Might need a general Aerial speed limit for each character
    constructor(grndSpeedVelDecay, aerialVelocityDecay, aerialSpeedInpulseLimit, aerialVelocityMultiplier, airDodgeSpeed, maxWalkSpeed, maxRunSpeed, walkSpeedMultiplier, runSpeedMultiplier, fastFallSpeed, fallSpeed, dashMultiplier, maxDashSpeed, gravity) {
      this.GroundedVelocityDecay = grndSpeedVelDecay;
      this.AerialVelocityDecay = aerialVelocityDecay;
      this.AerialSpeedInpulseLimit = aerialSpeedInpulseLimit;
      this.ArielVelocityMultiplier = aerialVelocityMultiplier;
      this.AirDogeSpeed = airDodgeSpeed;
      this.MaxWalkSpeed = maxWalkSpeed;
      this.MaxRunSpeed = maxRunSpeed;
      this.WalkSpeedMulitplier = walkSpeedMultiplier;
      this.RunSpeedMultiplier = runSpeedMultiplier;
      this.FastFallSpeed = fastFallSpeed;
      this.FallSpeed = fallSpeed;
      this.DashMultiplier = dashMultiplier;
      this.MaxDashSpeed = maxDashSpeed;
      this.Gravity = gravity;
    }
  };
  var PlayerPointsComponent = class {
    damagePoints = 0;
    matchPoints = 0;
    defaultMatchPoints;
    constructor(defaultMatchPoints = 4) {
      this.defaultMatchPoints = defaultMatchPoints;
    }
    AddDamage(number) {
      this.damagePoints += number;
    }
    SubtractDamage(number) {
      this.damagePoints -= number;
    }
    AddMatchPoints(number) {
      this.matchPoints += number;
    }
    SubtractMatchPoints(number) {
      this.matchPoints -= number;
    }
    ResetMatchPoints() {
      this.matchPoints = this.defaultMatchPoints;
    }
    ResetDamagePoints() {
      this.damagePoints = 0;
    }
    get Damage() {
      return this.damagePoints;
    }
    SnapShot() {
      return {
        damagePoints: this.damagePoints,
        matchPoints: this.matchPoints
      };
    }
    SetFromSnapShot(snapShot) {
      this.damagePoints = snapShot.damagePoints;
      this.matchPoints = snapShot.matchPoints;
    }
  };
  var PlayerFlagsComponent = class {
    facingRight = false;
    fastFalling = false;
    hitPauseFrames = 0;
    intangabilityFrames = 0;
    disablePlatformDetection = 0;
    FaceRight() {
      this.facingRight = true;
    }
    FaceLeft() {
      this.facingRight = false;
    }
    FastFallOn() {
      this.fastFalling = true;
    }
    FastFallOff() {
      this.fastFalling = false;
    }
    ChangeDirections() {
      this.facingRight = !this.facingRight;
    }
    SetHitPauseFrames(frames) {
      this.hitPauseFrames = frames;
    }
    DecrementHitPause() {
      this.hitPauseFrames--;
    }
    DecrementIntangabilityFrames() {
      this.intangabilityFrames--;
    }
    SetIntangabilityFrames(frames) {
      this.intangabilityFrames = frames;
    }
    DecrementDisablePlatDetection() {
      this.disablePlatformDetection--;
    }
    SetDisablePlatFrames(frameCount) {
      this.disablePlatformDetection = frameCount;
    }
    ZeroIntangabilityFrames() {
      this.intangabilityFrames = 0;
    }
    ZeroHitPauseFrames() {
      this.hitPauseFrames = 0;
    }
    ZeroDisablePlatDetection() {
      this.disablePlatformDetection = 0;
    }
    get IsFastFalling() {
      return this.fastFalling;
    }
    get IsFacingRight() {
      return this.facingRight;
    }
    get IsFacingLeft() {
      return !this.facingRight;
    }
    get IsInHitPause() {
      return this.hitPauseFrames > 0;
    }
    get IsIntangible() {
      return this.intangabilityFrames > 0;
    }
    get IsPlatDetectDisabled() {
      return this.disablePlatformDetection > 0;
    }
    SnapShot() {
      return {
        FacingRight: this.facingRight,
        FastFalling: this.fastFalling,
        HitPauseFrames: this.hitPauseFrames,
        IntangabilityFrames: this.intangabilityFrames,
        DisablePlatDetection: this.disablePlatformDetection
      };
    }
    SetFromSnapShot(snapShot) {
      this.fastFalling = snapShot.FastFalling;
      this.facingRight = snapShot.FacingRight;
      this.hitPauseFrames = snapShot.HitPauseFrames;
      this.intangabilityFrames = snapShot.IntangabilityFrames;
      this.disablePlatformDetection = snapShot.DisablePlatDetection;
    }
  };
  var ECBComponent = class {
    SensorDepth = 1;
    yOffset;
    x = 0;
    y = 0;
    prevX = 0;
    prevY = 0;
    color;
    height;
    width;
    originalHeight;
    originalWidth;
    originalYOffset;
    curVerts = new Array(4);
    prevVerts = new Array(4);
    allVerts = new Array(8);
    ecbStateShapes;
    constructor(shapes, height = 100, width = 100, yOffset = 0) {
      this.color = "orange";
      this.height = height;
      this.width = width;
      this.originalHeight = height;
      this.originalWidth = width;
      this.originalYOffset = yOffset;
      this.yOffset = yOffset;
      this.ecbStateShapes = shapes;
      FillArrayWithFlatVec(this.curVerts);
      FillArrayWithFlatVec(this.prevVerts);
      this.loadAllVerts();
      this.update();
    }
    GetHull() {
      return CreateConvexHull(this.allVerts);
    }
    GetActiveVerts() {
      return this.curVerts;
    }
    UpdatePreviousECB() {
      this.prevX = this.x;
      this.prevY = this.y;
      const prevVert = this.prevVerts;
      const curVert = this.curVerts;
      prevVert[0].X = curVert[0].X;
      prevVert[0].Y = curVert[0].Y;
      prevVert[1].X = curVert[1].X;
      prevVert[1].Y = curVert[1].Y;
      prevVert[2].X = curVert[2].X;
      prevVert[2].Y = curVert[2].Y;
      prevVert[3].X = curVert[3].X;
      prevVert[3].Y = curVert[3].Y;
    }
    SetInitialPosition(x, y) {
      this.MoveToPosition(x, y);
      this.UpdatePreviousECB();
    }
    MoveToPosition(x, y) {
      this.x = x;
      this.y = y;
      this.update();
    }
    SetECBShape(stateId) {
      const shape = this.ecbStateShapes.get(stateId);
      if (shape === void 0) {
        this.yOffset = this.originalYOffset;
        this.height = this.originalHeight;
        this.width = this.originalWidth;
        this.update();
        return;
      }
      this.yOffset = shape.yOffset;
      this.height = shape.height;
      this.width = shape.width;
      this.update();
    }
    update() {
      const px = this.x;
      const py = this.y;
      const height = this.height;
      const width = this.width;
      const yOffset = this.yOffset;
      const bottomX = px;
      const bottomY = py + yOffset;
      const topX = px;
      const topY = bottomY - height;
      const leftX = bottomX - width / 2;
      const leftY = bottomY - height / 2;
      const rightX = bottomX + width / 2;
      const rightY = leftY;
      this.curVerts[0].X = bottomX;
      this.curVerts[0].Y = bottomY;
      this.curVerts[1].X = leftX;
      this.curVerts[1].Y = leftY;
      this.curVerts[2].X = topX;
      this.curVerts[2].Y = topY;
      this.curVerts[3].X = rightX;
      this.curVerts[3].Y = rightY;
    }
    get Bottom() {
      return this.curVerts[0];
    }
    get PrevBottom() {
      return this.prevVerts[0];
    }
    get Left() {
      return this.curVerts[1];
    }
    get PrevLeft() {
      return this.prevVerts[1];
    }
    get Top() {
      return this.curVerts[2];
    }
    get PrevTop() {
      return this.prevVerts[2];
    }
    get Right() {
      return this.curVerts[3];
    }
    get PrevRight() {
      return this.prevVerts[3];
    }
    get Height() {
      return this.height;
    }
    get Width() {
      return this.width;
    }
    get YOffset() {
      return this.yOffset;
    }
    GetColor() {
      return this.color;
    }
    SetColor(color) {
      this.color = color;
    }
    ResetECBShape() {
      this.height = this.originalHeight;
      this.width = this.originalWidth;
      this.yOffset = this.originalYOffset;
      this.update();
    }
    SnapShot() {
      return {
        posX: this.x,
        posY: this.y,
        prevPosX: this.prevX,
        prevPosY: this.prevY,
        YOffset: this.yOffset,
        Height: this.height,
        Width: this.width
      };
    }
    SetFromSnapShot(snapShot) {
      this.x = snapShot.posX;
      this.y = snapShot.posY;
      this.prevX = snapShot.prevPosX;
      this.prevY = snapShot.prevPosY;
      this.yOffset = snapShot.YOffset;
      this.height = snapShot.Height;
      this.width = snapShot.Width;
      this.update();
      const px = this.prevX;
      const py = this.prevY;
      const height = this.height;
      const width = this.width;
      const yOffset = this.yOffset;
      const bottomX = px;
      const bottomY = py + yOffset;
      const topX = px;
      const topY = bottomY - height;
      const leftX = bottomX - width / 2;
      const leftY = bottomY - height / 2;
      const rightX = bottomX + width / 2;
      const rightY = leftY;
      this.prevVerts[0].X = bottomX;
      this.prevVerts[0].Y = bottomY;
      this.prevVerts[1].X = leftX;
      this.prevVerts[1].Y = leftY;
      this.prevVerts[2].X = topX;
      this.prevVerts[2].Y = topY;
      this.prevVerts[3].X = rightX;
      this.prevVerts[3].Y = rightY;
    }
    loadAllVerts() {
      this.allVerts.length = 0;
      for (let i = 0; i < 4; i++) {
        this.allVerts.push(this.prevVerts[i]);
      }
      for (let i = 0; i < 4; i++) {
        this.allVerts.push(this.curVerts[i]);
      }
    }
  };
  var HurtCapsule = class {
    StartOffsetX;
    StartOffsetY;
    EndOffsetX;
    EndOffsetY;
    Radius;
    constructor(startOffsetX, startOffsetY, endOffsetX, endOffsetY, radius) {
      this.StartOffsetX = startOffsetX;
      this.StartOffsetY = startOffsetY;
      this.EndOffsetX = endOffsetX;
      this.EndOffsetY = endOffsetY;
      this.Radius = radius;
    }
    GetStartPosition(x, y, vecPool) {
      return vecPool.Rent().SetXY(this.StartOffsetX + x, this.StartOffsetY + y);
    }
    GetEndPosition(x, y, vecPool) {
      return vecPool.Rent().SetXY(this.EndOffsetX + x, this.EndOffsetY + y);
    }
  };
  var HurtCapsulesComponent = class {
    HurtCapsules;
    constructor(hurtCapsules) {
      this.HurtCapsules = hurtCapsules;
    }
  };
  var LedgeDetectorComponent = class {
    maxGrabs = 15;
    numberOfLedgeGrabs = 0;
    yOffset;
    x = 0;
    y = 0;
    width;
    height;
    rightSide = new Array(4);
    leftSide = new Array(4);
    constructor(x, y, width, height, yOffset = -130) {
      this.height = height;
      this.width = width;
      this.yOffset = yOffset;
      FillArrayWithFlatVec(this.rightSide);
      FillArrayWithFlatVec(this.leftSide);
      this.MoveTo(x, y);
    }
    MoveTo(x, y) {
      this.x = x;
      this.y = y + this.yOffset;
      this.update();
    }
    get LeftSide() {
      return this.leftSide;
    }
    get RightSide() {
      return this.rightSide;
    }
    get Width() {
      return this.width;
    }
    get Height() {
      return this.height;
    }
    update() {
      const rightBottomLeft = this.rightSide[0];
      const rightTopLeft = this.rightSide[1];
      const rightTopRight = this.rightSide[2];
      const rightBottomRight = this.rightSide[3];
      const leftBottomLeft = this.leftSide[0];
      const leftTopLeft = this.leftSide[1];
      const leftTopRight = this.leftSide[2];
      const leftBottomRight = this.leftSide[3];
      const widthRight = this.x + this.width;
      const widthLeft = this.x - this.width;
      const bottomHeight = this.y + this.height;
      rightBottomLeft.X = this.x;
      rightBottomLeft.Y = bottomHeight;
      rightTopLeft.X = this.x;
      rightTopLeft.Y = this.y;
      rightTopRight.X = widthRight;
      rightTopRight.Y = this.y;
      rightBottomRight.X = widthRight;
      rightBottomRight.Y = bottomHeight;
      leftBottomLeft.X = widthLeft;
      leftBottomLeft.Y = bottomHeight;
      leftTopLeft.X = widthLeft;
      leftTopLeft.Y = this.y;
      leftTopRight.X = this.x;
      leftTopRight.Y = this.y;
      leftBottomRight.X = this.x;
      leftBottomRight.Y = bottomHeight;
    }
    SnapShot() {
      return {
        middleX: this.x,
        middleY: this.y,
        numberOfLedgeGrabs: this.numberOfLedgeGrabs
      };
    }
    get CanGrabLedge() {
      return this.numberOfLedgeGrabs < this.maxGrabs;
    }
    IncrementLedgeGrabs() {
      this.numberOfLedgeGrabs++;
    }
    ZeroLedgeGrabCount() {
      this.numberOfLedgeGrabs = 0;
    }
    SetFromSnapShot(snapShot) {
      this.MoveTo(snapShot.middleX, snapShot.middleY);
      this.numberOfLedgeGrabs = snapShot.numberOfLedgeGrabs;
    }
  };
  var JumpComponent = class {
    numberOfJumps = 2;
    jumpCount = 0;
    JumpVelocity;
    constructor(jumpVelocity, numberOfJumps = 2) {
      this.JumpVelocity = jumpVelocity;
      this.numberOfJumps = numberOfJumps;
    }
    HasJumps() {
      return this.jumpCount < this.numberOfJumps;
    }
    OnFirstJump() {
      return this.jumpCount === 1;
    }
    JumpCountIsZero() {
      return this.jumpCount === 0;
    }
    IncrementJumps() {
      this.jumpCount++;
    }
    ResetJumps() {
      this.jumpCount = 0;
    }
    SnapShot() {
      return this.jumpCount;
    }
    SetFromSnapShot(snapShot) {
      this.jumpCount = snapShot;
    }
  };
  var HitBubble = class {
    BubbleId;
    Damage;
    Priority;
    Radius;
    launchAngle;
    activeStartFrame;
    activeEndFrame;
    frameOffsets;
    constructor(id, damage, priority, radius, launchAngle, frameOffsets) {
      this.BubbleId = id;
      this.Damage = damage;
      this.Priority = priority;
      this.Radius = radius;
      this.launchAngle = launchAngle;
      const activeframes = Array.from(frameOffsets.keys()).sort((a, b) => a - b);
      this.activeStartFrame = activeframes[0];
      this.activeEndFrame = activeframes[activeframes.length - 1];
      this.frameOffsets = frameOffsets;
    }
    IsActive(attackFrameNumber) {
      return attackFrameNumber >= this.activeStartFrame && attackFrameNumber <= this.activeEndFrame;
    }
    GetLocalPosiitionOffsetForFrame(frameNumber) {
      return this.frameOffsets.get(frameNumber);
    }
    GetGlobalPosition(vecPool, playerX, playerY, facinRight, attackFrameNumber) {
      const offset = this.frameOffsets.get(attackFrameNumber);
      if (offset === void 0) {
        return void 0;
      }
      const globalX = facinRight ? playerX + offset.X : playerX - offset.X;
      const globalY = playerY + offset.Y;
      return vecPool.Rent().SetXY(globalX, globalY);
    }
  };
  var Attack = class {
    Name;
    TotalFrameLength;
    InteruptableFrame;
    GravityActive;
    BaseKnockBack;
    KnockBackScaling;
    ImpulseClamp;
    PlayerIdsHit = /* @__PURE__ */ new Set();
    Impulses = /* @__PURE__ */ new Map();
    CanOnlyFallOffLedgeIfFacingAwayFromIt = false;
    HitBubbles;
    onEnter = (w, p) => {
    };
    onUpdate = (w, p, fN) => {
    };
    onExit = (w, p) => {
    };
    constructor(name, totalFrameLength, interuptableFrame, baseKb, kbScaling, impulseClamp, hitBubbles, canOnlyFallOffLedgeWhenFacingAwayFromIt = false, gravityActive = true, impulses = void 0, onEnter, onUpdate, onExit) {
      this.Name = name;
      this.TotalFrameLength = totalFrameLength;
      this.InteruptableFrame = interuptableFrame;
      this.GravityActive = gravityActive;
      this.CanOnlyFallOffLedgeIfFacingAwayFromIt = canOnlyFallOffLedgeWhenFacingAwayFromIt;
      this.BaseKnockBack = baseKb;
      this.KnockBackScaling = kbScaling;
      this.ImpulseClamp = impulseClamp;
      this.HitBubbles = hitBubbles.sort((a, b) => a.Priority - b.Priority);
      if (impulses !== void 0) {
        this.Impulses = impulses;
      }
      if (onEnter !== void 0) {
        this.onEnter = onEnter;
      }
      if (onUpdate !== void 0) {
        this.onUpdate = onUpdate;
      }
      if (onExit !== void 0) {
        this.onExit = onExit;
      }
    }
    get OnEnter() {
      return this.onEnter;
    }
    get OnUpdate() {
      return this.onUpdate;
    }
    get OnExit() {
      return this.onExit;
    }
    GetActiveImpulseForFrame(frameNumber) {
      return this.Impulses.get(frameNumber);
    }
    GetActiveHitBubblesForFrame(frameNumber, activeHBs) {
      const hitBubbleslength = this.HitBubbles.length;
      if (hitBubbleslength === 0) {
        return activeHBs;
      }
      for (let i = 0; i < hitBubbleslength; i++) {
        const hb = this.HitBubbles[i];
        if (hb.IsActive(frameNumber)) {
          activeHBs.AddBubble(hb);
        }
      }
      return activeHBs;
    }
    HitPlayer(playerID) {
      this.PlayerIdsHit.add(playerID);
    }
    HasHitPlayer(playerID) {
      return this.PlayerIdsHit.has(playerID);
    }
    ResetPlayerIdsHit() {
      this.PlayerIdsHit.clear();
    }
  };
  var AttackBuilder = class {
    name = "";
    totalFrames = 0;
    interuptableFrame = 0;
    hasGravtity = true;
    baseKnockBack = 0;
    knockBackScaling = 0;
    impulseClamp;
    impulses;
    hitBubbles = [];
    canOnlyFallOffLedgeIfFacingAwayFromIt = false;
    onEnter;
    onUpdate;
    onExit;
    constructor(name) {
      this.name = name;
    }
    WithTotalFrames(totalFrames) {
      this.totalFrames = totalFrames;
      return this;
    }
    WithImpulses(impulses, impulseClamp) {
      this.impulses = impulses;
      this.impulseClamp = impulseClamp;
      return this;
    }
    WithInteruptableFrame(interuptFrame) {
      this.interuptableFrame = interuptFrame;
      return this;
    }
    WithGravity(gravity) {
      this.hasGravtity = gravity;
      return this;
    }
    CanOnlyFallOffLedgeIfFacingIt() {
      this.canOnlyFallOffLedgeIfFacingAwayFromIt = true;
      return this;
    }
    WithBaseKnockBack(baseKb) {
      this.baseKnockBack = baseKb;
      return this;
    }
    WithKnockBackScaling(kbScaling) {
      this.knockBackScaling = kbScaling;
      return this;
    }
    WithEnterAction(action) {
      this.onEnter = action;
      return this;
    }
    WithUpdateAction(action) {
      this.onUpdate = action;
      return this;
    }
    WithExitAction(action) {
      this.onExit = action;
      return this;
    }
    WithHitBubble(damage, radius, priority, launchAngle, frameOffsets) {
      const hitBubId = this.hitBubbles.length;
      const hitBub = new HitBubble(
        hitBubId,
        damage,
        priority,
        radius,
        launchAngle,
        frameOffsets
      );
      this.hitBubbles.push(hitBub);
      return this;
    }
    Build() {
      return new Attack(
        this.name,
        this.totalFrames,
        this.interuptableFrame,
        this.baseKnockBack,
        this.knockBackScaling,
        this.impulseClamp,
        this.hitBubbles,
        this.canOnlyFallOffLedgeIfFacingAwayFromIt,
        this.hasGravtity,
        this.impulses,
        this.onEnter,
        this.onUpdate,
        this.onExit
      );
    }
  };
  var AttackComponment = class {
    attacks;
    currentAttack = void 0;
    constructor(attacks) {
      this.attacks = attacks;
    }
    GetAttack() {
      return this.currentAttack;
    }
    SetCurrentAttack(gameEventId) {
      const attackId = AttackGameEventMappings.get(gameEventId);
      if (attackId === void 0) {
        return;
      }
      const attack = this.attacks.get(attackId);
      if (attack === void 0) {
        return;
      }
      this.currentAttack = attack;
    }
    ZeroCurrentAttack() {
      if (this.currentAttack === void 0) {
        return;
      }
      this.currentAttack.ResetPlayerIdsHit();
      this.currentAttack = void 0;
    }
    SnapShot() {
      return this.currentAttack;
    }
    SetFromSnapShot(snapShot) {
      this.currentAttack = snapShot;
    }
  };
  var Sensor = class {
    xOffset = 0;
    yOffset = 0;
    radius = 0;
    active = false;
    GetGlobalPosition(vecPool, globalX, globalY, facingRight) {
      const x = facingRight ? globalX + this.xOffset : globalX - this.xOffset;
      const y = globalY + this.yOffset;
      return vecPool.Rent().SetXY(x, y);
    }
    set Radius(value) {
      this.radius = value;
    }
    set XOffset(value) {
      this.xOffset = value;
    }
    set YOffset(value) {
      this.yOffset = value;
    }
    get Radius() {
      return this.radius;
    }
    get XOffset() {
      return this.xOffset;
    }
    get YOffset() {
      return this.yOffset;
    }
    get IsActive() {
      return this.active;
    }
    Activate() {
      this.active = true;
    }
    Deactivate() {
      this.xOffset = 0;
      this.yOffset = 0;
      this.radius = 0;
      this.active = false;
    }
  };
  var defaultReactor = (w, sensorOwner, detectedPlayer) => {
  };
  var SensorComponent = class {
    currentSensorIdx = 0;
    sensors = new Array(10);
    sensorReactor = defaultReactor;
    constructor() {
      for (let i = 0; i < this.sensors.length; i++) {
        this.sensors[i] = new Sensor();
      }
    }
    ReactAction(world, pOwnerOfSensors, playerDetectedBySensor) {
      return this.sensorReactor(world, pOwnerOfSensors, playerDetectedBySensor);
    }
    SetSensorReactor(sr) {
      this.sensorReactor = sr;
    }
    ActivateSensor(yOffset, xOffset, radius) {
      if (this.currentSensorIdx >= this.sensors.length) {
        throw new Error("No more sensors available to activate.");
      }
      this.activateSensor(yOffset, xOffset, radius);
      return this;
    }
    activateSensor(yOffset, xOffset, radius) {
      const sensor = this.sensors[this.currentSensorIdx];
      sensor.XOffset = xOffset;
      sensor.YOffset = yOffset;
      sensor.Radius = radius;
      sensor.Activate();
      this.currentSensorIdx++;
    }
    DeactivateSensors() {
      const length = this.sensors.length;
      for (let i = 0; i < length; i++) {
        const sensor = this.sensors[i];
        if (sensor.IsActive) {
          sensor.Deactivate();
        }
      }
      this.sensorReactor = defaultReactor;
      this.currentSensorIdx = 0;
    }
    get Sensors() {
      return this.sensors;
    }
    get NumberActive() {
      return this.currentSensorIdx;
    }
    SnapShot() {
      const snapShot = {
        sensors: [],
        reactor: this.sensorReactor
      };
      const length = this.sensors.length;
      for (let i = 0; i < length; i++) {
        const sensor = this.sensors[i];
        if (sensor.IsActive) {
          snapShot.sensors.push({
            yOffset: sensor.YOffset,
            xOffset: sensor.XOffset,
            radius: sensor.Radius
          });
        }
      }
      return snapShot;
    }
    SetFromSnapShot(snapShot) {
      this.DeactivateSensors();
      const snapShotSensorLength = snapShot.sensors.length;
      for (let i = 0; i < snapShotSensorLength; i++) {
        const snapShotSensor = snapShot.sensors[i];
        this.activateSensor(
          snapShotSensor.yOffset,
          snapShotSensor.xOffset,
          snapShotSensor.radius
        );
      }
      this.sensorReactor = snapShot.reactor || defaultReactor;
      this.currentSensorIdx = snapShot.sensors.length;
    }
  };
  var SpeedsComponentBuilder = class {
    groundedVelocityDecay = 0;
    aerialVelocityDecay = 0;
    aerialSpeedInpulseLimit = 0;
    aerialSpeedMultiplier = 0;
    airDodgeSpeed = 0;
    maxWalkSpeed = 0;
    maxRunSpeed = 0;
    dashMutiplier = 0;
    maxDashSpeed = 0;
    walkSpeedMulitplier = 0;
    runSpeedMultiplier = 0;
    fastFallSpeed = 0;
    fallSpeed = 0;
    gravity = 0;
    SetAerialSpeeds(aerialVelocityDecay, aerialSpeedImpulseLimit, aerialSpeedMultiplier) {
      this.aerialVelocityDecay = aerialVelocityDecay;
      this.aerialSpeedInpulseLimit = aerialSpeedImpulseLimit;
      this.aerialSpeedMultiplier = aerialSpeedMultiplier;
    }
    SetAirDodgeSpeed(airDodgeSpeed) {
      this.airDodgeSpeed = airDodgeSpeed;
    }
    SetFallSpeeds(fastFallSpeed, fallSpeed, gravity = 1) {
      this.fallSpeed = fallSpeed;
      this.fastFallSpeed = fastFallSpeed;
      this.gravity = gravity;
    }
    SetWalkSpeeds(maxWalkSpeed, walkSpeedMultiplier) {
      this.maxWalkSpeed = maxWalkSpeed;
      this.walkSpeedMulitplier = walkSpeedMultiplier;
    }
    SetRunSpeeds(maxRunSpeed, runSpeedMultiplier) {
      this.runSpeedMultiplier = runSpeedMultiplier;
      this.maxRunSpeed = maxRunSpeed;
    }
    SetDashSpeeds(dashMultiplier, maxDashSpeed) {
      this.dashMutiplier = dashMultiplier;
      this.maxDashSpeed = maxDashSpeed;
    }
    SetGroundedVelocityDecay(groundedVelocityDecay) {
      this.groundedVelocityDecay = groundedVelocityDecay;
    }
    Build() {
      return new SpeedsComponent(
        this.groundedVelocityDecay,
        this.aerialVelocityDecay,
        this.aerialSpeedInpulseLimit,
        this.aerialSpeedMultiplier,
        this.airDodgeSpeed,
        this.maxWalkSpeed,
        this.maxRunSpeed,
        this.walkSpeedMulitplier,
        this.runSpeedMultiplier,
        this.fastFallSpeed,
        this.fallSpeed,
        this.dashMutiplier,
        this.maxDashSpeed,
        this.gravity
      );
    }
  };

  // game/character/default.ts
  var DefaultCharacterConfig = class {
    FrameLengths = /* @__PURE__ */ new Map();
    SCB;
    ECBHeight;
    ECBWidth;
    ECBOffset;
    ECBShapes = /* @__PURE__ */ new Map();
    HurtCapsules = [];
    JumpVelocity;
    NumberOfJumps;
    LedgeBoxHeight;
    LedgeBoxWidth;
    ledgeBoxYOffset;
    attacks = /* @__PURE__ */ new Map();
    Weight;
    constructor() {
      const neutralAttack = GetNAtk();
      const sideTilt = GetSideTilt();
      const sideTiltUp = GetSideTiltUp();
      const sideTiltDown = GetSideTiltDown();
      const downTilt = GetDownTilt();
      const upTilt = GetUpTilt();
      const sideCharge = GetSideCharge();
      const sideChargeExtension = GetSideChargeExtension();
      const upCharge = GetUpcharge();
      const UpChargeExtension = GetUpchargeExt();
      const downCharge = GetDownCharge();
      const downChargeEx = GetDownChargeExtension();
      const dashAtk = GetDashAttack();
      const sideSpecial = GetSideSpecial();
      const sideSpecialEx = GetSideSpecialExtension();
      const sideSpecialAir = GetSideSpecialAir();
      const sideSpecialExAir = GetSideSpecialExtensionAir();
      const DownSpecial2 = GetDownSpecial();
      const neutralAir = GetNeutralAir();
      const fAir = GetFAir();
      const uAir = GetUAir();
      const bAir = GetBAir();
      const dAir = GetDAir();
      this.FrameLengths.set(STATE_IDS.JUMP_SQUAT_S, 4).set(STATE_IDS.TURN_S, 3).set(STATE_IDS.DASH_S, 20).set(STATE_IDS.DASH_TURN_S, 1).set(STATE_IDS.RUN_TURN_S, 20).set(STATE_IDS.STOP_RUN_S, 15).set(STATE_IDS.JUMP_S, 2).set(STATE_IDS.AIR_DODGE_S, 22).set(STATE_IDS.LAND_S, 11).set(STATE_IDS.SOFT_LAND_S, 2).set(STATE_IDS.ATTACK_S, neutralAttack.TotalFrameLength).set(STATE_IDS.DASH_ATTACK_S, dashAtk.TotalFrameLength).set(STATE_IDS.DOWN_TILT_S, downTilt.TotalFrameLength).set(STATE_IDS.UP_TILT_S, upTilt.TotalFrameLength).set(STATE_IDS.SIDE_TILT_S, sideTilt.TotalFrameLength).set(STATE_IDS.SIDE_CHARGE_S, sideCharge.TotalFrameLength).set(STATE_IDS.SIDE_CHARGE_EX_S, sideChargeExtension.TotalFrameLength).set(STATE_IDS.UP_CHARGE_S, upCharge.TotalFrameLength).set(STATE_IDS.UP_CHARGE_EX_S, UpChargeExtension.TotalFrameLength).set(STATE_IDS.DOWN_CHARGE_S, downCharge.TotalFrameLength).set(STATE_IDS.DOWN_CHARGE_EX_S, downChargeEx.TotalFrameLength).set(STATE_IDS.N_AIR_S, neutralAir.TotalFrameLength).set(STATE_IDS.F_AIR_S, fAir.TotalFrameLength).set(STATE_IDS.U_AIR_S, uAir.TotalFrameLength).set(STATE_IDS.B_AIR_S, bAir.TotalFrameLength).set(STATE_IDS.D_AIR_S, dAir.TotalFrameLength).set(STATE_IDS.SIDE_SPCL_S, sideSpecial.TotalFrameLength).set(STATE_IDS.SIDE_SPCL_EX_S, sideSpecialEx.TotalFrameLength).set(STATE_IDS.SIDE_SPCL_AIR_S, sideSpecialAir.TotalFrameLength).set(STATE_IDS.SIDE_SPCL_EX_AIR_S, sideSpecialExAir.TotalFrameLength).set(STATE_IDS.DOWN_SPCL_S, DownSpecial2.TotalFrameLength);
      this.ECBShapes.set(STATE_IDS.N_FALL_S, {
        height: 70,
        width: 70,
        yOffset: -25
      }).set(STATE_IDS.JUMP_S, { height: 60, width: 70, yOffset: -15 }).set(STATE_IDS.N_AIR_S, { height: 60, width: 70, yOffset: -25 }).set(STATE_IDS.F_AIR_S, { height: 60, width: 70, yOffset: -25 }).set(STATE_IDS.U_AIR_S, { height: 60, width: 60, yOffset: -25 }).set(STATE_IDS.B_AIR_S, { height: 60, width: 60, yOffset: -25 }).set(STATE_IDS.D_AIR_S, { height: 90, width: 60, yOffset: -10 }).set(STATE_IDS.DOWN_CHARGE_S, { height: 110, width: 85, yOffset: 0 }).set(STATE_IDS.DOWN_CHARGE_EX_S, { height: 65, width: 100, yOffset: 0 }).set(STATE_IDS.AIR_DODGE_S, { height: 60, width: 70, yOffset: -15 }).set(STATE_IDS.DOWN_TILT_S, { height: 50, width: 100, yOffset: 0 }).set(STATE_IDS.DOWN_SPCL_S, { height: 65, width: 105, yOffset: 0 }).set(STATE_IDS.JUMP_SQUAT_S, { height: 70, width: 80, yOffset: 0 }).set(STATE_IDS.LAND_S, { height: 65, width: 90, yOffset: 0 }).set(STATE_IDS.SOFT_LAND_S, { height: 85, width: 95, yOffset: 0 }).set(STATE_IDS.LEDGE_GRAB_S, { height: 110, width: 55, yOffset: 0 }).set(STATE_IDS.CROUCH_S, { height: 50, width: 100, yOffset: 0 });
      this.SCB = new SpeedsComponentBuilder();
      this.SCB.SetWalkSpeeds(6, 1.6);
      this.SCB.SetRunSpeeds(10, 2.2);
      this.SCB.SetFallSpeeds(16, 9, 0.6);
      this.SCB.SetAerialSpeeds(0.7, 9, 1.8);
      this.SCB.SetDashSpeeds(3, 13);
      this.SCB.SetAirDodgeSpeed(20);
      this.SCB.SetGroundedVelocityDecay(0.8);
      this.ECBOffset = 0;
      this.ECBHeight = 100;
      this.ECBWidth = 100;
      this.populateHurtCircles();
      this.Weight = 110;
      this.JumpVelocity = 17;
      this.NumberOfJumps = 2;
      this.LedgeBoxHeight = 35;
      this.LedgeBoxWidth = 80;
      this.ledgeBoxYOffset = -130;
      this.attacks.set(ATTACK_IDS.N_GRND_ATK, neutralAttack).set(ATTACK_IDS.D_TILT_ATK, downTilt).set(ATTACK_IDS.U_TILT_ATK, upTilt).set(ATTACK_IDS.S_TILT_ATK, sideTilt).set(ATTACK_IDS.S_TILT_U_ATK, sideTiltUp).set(ATTACK_IDS.S_TITL_D_ATK, sideTiltDown).set(ATTACK_IDS.S_CHARGE_ATK, sideCharge).set(ATTACK_IDS.S_CHARGE_EX_ATK, sideChargeExtension).set(ATTACK_IDS.U_CHARGE_ATK, upCharge).set(ATTACK_IDS.U_CHARGE_EX_ATK, UpChargeExtension).set(ATTACK_IDS.D_CHARGE_ATK, downCharge).set(ATTACK_IDS.D_CHARGE_EX_ATK, downChargeEx).set(ATTACK_IDS.S_SPCL_ATK, sideSpecial).set(ATTACK_IDS.S_SPCL_EX_ATK, sideSpecialEx).set(ATTACK_IDS.D_SPCL_ATK, DownSpecial2).set(ATTACK_IDS.N_AIR_ATK, neutralAir).set(ATTACK_IDS.F_AIR_ATK, fAir).set(ATTACK_IDS.U_AIR_ATK, uAir).set(ATTACK_IDS.B_AIR_ATK, bAir).set(ATTACK_IDS.D_AIR_ATK, dAir).set(ATTACK_IDS.S_SPCL_AIR_ATK, sideSpecialAir).set(ATTACK_IDS.S_SPCL_EX_AIR_ATK, sideSpecialExAir).set(ATTACK_IDS.DASH_ATK, dashAtk);
    }
    populateHurtCircles() {
      const body = new HurtCapsule(0, -40, 0, -50, 40);
      const head = new HurtCapsule(0, -105, 0, -125, 14);
      this.HurtCapsules.push(head);
      this.HurtCapsules.push(body);
    }
  };
  function GetNAtk() {
    const hb1OffSets = /* @__PURE__ */ new Map();
    const hb1Frame3Offset = new FlatVec(30, -50);
    const hb1Frame4Offset = new FlatVec(60, -50);
    const hb1Frame5Offset = new FlatVec(80, -50);
    const hb1Frame6Offset = new FlatVec(80, -50);
    const hb1Frame7Offset = new FlatVec(80, -50);
    hb1OffSets.set(3, hb1Frame3Offset).set(4, hb1Frame4Offset).set(5, hb1Frame5Offset).set(6, hb1Frame6Offset).set(7, hb1Frame7Offset);
    const hb2OffSets = /* @__PURE__ */ new Map();
    const hb2Frame3Offset = new FlatVec(15, -50);
    const hb2Frame4Offset = new FlatVec(25, -50);
    const hb2Frame5Offset = new FlatVec(55, -50);
    const hb2Frame6Offset = new FlatVec(65, -50);
    const hb2Frame7Offset = new FlatVec(65, -50);
    hb2OffSets.set(3, hb2Frame3Offset).set(4, hb2Frame4Offset).set(5, hb2Frame5Offset).set(6, hb2Frame6Offset).set(7, hb2Frame7Offset);
    const bldr = new AttackBuilder("NAttack");
    bldr.WithBaseKnockBack(15).WithKnockBackScaling(54).WithGravity(true).WithTotalFrames(18).WithInteruptableFrame(15).WithHitBubble(7, 16, 0, 60, hb1OffSets).WithHitBubble(6, 14, 1, 60, hb2OffSets);
    return bldr.Build();
  }
  function GetDashAttack() {
    const basKnowback = 15;
    const knockBackScaling = 45;
    const totalFrames = 37;
    const radius = 25;
    const damage = 12;
    const startFrame = 5;
    const endFrame = 15;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const impulses = /* @__PURE__ */ new Map();
    for (let i = 0; i < 15; i++) {
      impulses.set(i, new FlatVec(4, 0));
    }
    hb1Offsets.set(5, new FlatVec(40, -60)).set(6, new FlatVec(40, -60)).set(7, new FlatVec(40, -60)).set(8, new FlatVec(40, -60)).set(9, new FlatVec(40, -60)).set(10, new FlatVec(40, -60)).set(11, new FlatVec(40, -60)).set(12, new FlatVec(40, -60)).set(13, new FlatVec(40, -60)).set(14, new FlatVec(40, -60)).set(15, new FlatVec(40, -60));
    const bldr = new AttackBuilder("DashAttack");
    bldr.WithGravity(true).WithBaseKnockBack(basKnowback).WithKnockBackScaling(knockBackScaling).WithTotalFrames(totalFrames).WithImpulses(impulses, 18).WithHitBubble(damage, radius, 0, 50, hb1Offsets);
    return bldr.Build();
  }
  function GetNeutralAir() {
    const activeFrames = 40;
    const hb1OffSets = /* @__PURE__ */ new Map();
    hb1OffSets.set(6, new FlatVec(80, -50)).set(7, new FlatVec(85, -50)).set(8, new FlatVec(90, -50)).set(9, new FlatVec(90, -50));
    const hb2OffSets = (/* @__PURE__ */ new Map()).set(6, new FlatVec(35, -50)).set(7, new FlatVec(40, -50)).set(8, new FlatVec(45, -50)).set(9, new FlatVec(47, -50));
    const hb3offSets = (/* @__PURE__ */ new Map()).set(6, new FlatVec(10, -50)).set(7, new FlatVec(10, -50)).set(8, new FlatVec(10, -50)).set(9, new FlatVec(10, -50));
    const hb4offsets = (/* @__PURE__ */ new Map()).set(19, new FlatVec(80, -50)).set(20, new FlatVec(85, -50)).set(21, new FlatVec(90, -50));
    const hb5Offsets = (/* @__PURE__ */ new Map()).set(19, new FlatVec(35, -50)).set(20, new FlatVec(40, -50)).set(21, new FlatVec(45, -50));
    const hb6Offsets = (/* @__PURE__ */ new Map()).set(19, new FlatVec(10, -50)).set(20, new FlatVec(10, -50)).set(21, new FlatVec(10, -50)).set(22, new FlatVec(10, -50)).set(23, new FlatVec(10, -50)).set(24, new FlatVec(10, -50)).set(25, new FlatVec(10, -50)).set(26, new FlatVec(10, -50));
    const bldr = new AttackBuilder("NAir").WithBaseKnockBack(10).WithKnockBackScaling(50).WithGravity(true).WithTotalFrames(activeFrames).WithHitBubble(12, 20, 0, 25, hb1OffSets).WithHitBubble(11, 19, 1, 25, hb2OffSets).WithHitBubble(13, 23, 3, 35, hb3offSets).WithHitBubble(15, 20, 4, 25, hb4offsets).WithHitBubble(12, 20, 5, 25, hb5Offsets).WithHitBubble(13, 23, 6, 35, hb6Offsets);
    return bldr.Build();
  }
  function GetUAir() {
    const uairTotalFrames = 31;
    const uairActiveStart = 6;
    const uairActiveEnd = 16;
    const uairFramesActive = uairActiveEnd - uairActiveStart + 1;
    const uairRadius = 22;
    const uairDamage = 12;
    const uairBaseKnockBack = 12;
    const uAirLaunchAngle = 20;
    const toeOfNoLaunchAngle = 340;
    const startAngle = 0;
    const endAngle = 200 * Math.PI / 180;
    const bubble1Offsets = generateArcBubbleOffsets(
      startAngle,
      endAngle,
      uairFramesActive,
      160,
      20
    );
    const bubble2Offsets = generateArcBubbleOffsets(
      startAngle,
      endAngle,
      uairFramesActive,
      140,
      20
    );
    const bubble3Offsets = generateArcBubbleOffsets(
      startAngle,
      endAngle,
      uairFramesActive,
      110,
      20
    );
    const uAirAttack = new AttackBuilder("UAir").WithTotalFrames(uairTotalFrames).WithInteruptableFrame(uairTotalFrames).WithBaseKnockBack(uairBaseKnockBack).WithKnockBackScaling(50).WithGravity(true).WithHitBubble(uairDamage, uairRadius, 2, uAirLaunchAngle, bubble1Offsets).WithHitBubble(uairDamage, uairRadius, 1, uAirLaunchAngle, bubble2Offsets).WithHitBubble(
      uairDamage,
      uairRadius,
      0,
      toeOfNoLaunchAngle,
      bubble3Offsets
    ).Build();
    return uAirAttack;
  }
  function GetFAir() {
    const fairTotalFrames = 40;
    const fairActiveStart = 11;
    const fairActiveEnd = 22;
    const fairFramesActive = fairActiveEnd - fairActiveStart + 1;
    const fairRadius = 25;
    const fairDamage = 17;
    const fairBaseKnockback = 55;
    const fairLaunchAngle = 30;
    const bubble1Offsets = generateArcBubbleOffsets(
      -Math.PI / 2,
      // start above (90deg)
      Math.PI / 2,
      // end below (270deg)
      fairFramesActive,
      155,
      // distance from player center
      130,
      // retract inwards by 10px at end
      12,
      false
    );
    const bubble2Offsets = generateArcBubbleOffsets(
      -Math.PI / 2,
      Math.PI / 2,
      fairFramesActive,
      130,
      110,
      12,
      false
    );
    const bubble3Offsets = generateArcBubbleOffsets(
      -Math.PI / 2,
      Math.PI / 2,
      fairFramesActive,
      100,
      100,
      12,
      false
    );
    const FairAttack = new AttackBuilder("FAir").WithTotalFrames(fairTotalFrames).WithInteruptableFrame(fairTotalFrames).WithBaseKnockBack(fairBaseKnockback).WithKnockBackScaling(65).WithGravity(true).WithHitBubble(fairDamage, fairRadius, 2, fairLaunchAngle, bubble1Offsets).WithHitBubble(fairDamage, fairRadius, 1, fairLaunchAngle, bubble2Offsets).WithHitBubble(fairDamage, fairRadius, 0, fairLaunchAngle, bubble3Offsets).Build();
    return FairAttack;
  }
  function GetBAir() {
    const totalFrames = 33;
    const activeStart = 9;
    const activeEnd = 15;
    const framesActive = activeEnd - activeStart + 1;
    const baseKnockBack = 17;
    const knockBackScaling = 50;
    const damage = 16;
    const radius = 27;
    const launchAngle = 150;
    const hb1OffSets = /* @__PURE__ */ new Map();
    const hb1Frame9Offset = new FlatVec(-40, -45);
    const hb1Frame10Offset = new FlatVec(-44, -45);
    const hb1Frame11Offset = new FlatVec(-46, -45);
    const hb1Frame12Offset = new FlatVec(-44, -45);
    const hb1Frame13Offset = new FlatVec(-44, -45);
    const hb1Frame14Offset = new FlatVec(-44, -45);
    const hb1Frame15Offset = new FlatVec(-44, -45);
    hb1OffSets.set(9, hb1Frame9Offset).set(10, hb1Frame10Offset).set(11, hb1Frame11Offset).set(12, hb1Frame12Offset).set(13, hb1Frame13Offset).set(14, hb1Frame14Offset).set(15, hb1Frame15Offset);
    const hb2OffSets = /* @__PURE__ */ new Map();
    const hb2Frame9Offset = new FlatVec(-70, -40);
    const hb2Frame10Offset = new FlatVec(-74, -39);
    const hb2Frame11Offset = new FlatVec(-77, -38);
    const hb2Frame12Offset = new FlatVec(-75, -38);
    const hb2Frame13Offset = new FlatVec(-75, -38);
    const hb2Frame14Offset = new FlatVec(-75, -38);
    const hb2Frame15Offset = new FlatVec(-75, -38);
    hb2OffSets.set(9, hb2Frame9Offset).set(10, hb2Frame10Offset).set(11, hb2Frame11Offset).set(12, hb2Frame12Offset).set(13, hb2Frame13Offset).set(14, hb2Frame14Offset).set(15, hb2Frame15Offset);
    const bldr = new AttackBuilder("BAir");
    bldr.WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithGravity(true).WithTotalFrames(totalFrames).WithHitBubble(damage, radius, 1, launchAngle, hb1OffSets).WithHitBubble(damage, radius, 0, launchAngle, hb2OffSets);
    return bldr.Build();
  }
  function GetDAir() {
    const activeFrames = 40;
    const radius = 30;
    const damage = 21;
    const baseKnockBack = 20;
    const knockBackScaling = 64;
    const launchAngle = 285;
    const hb1OffSets = /* @__PURE__ */ new Map();
    hb1OffSets.set(15, new FlatVec(0, -30)).set(16, new FlatVec(0, -30)).set(17, new FlatVec(0, -30)).set(18, new FlatVec(0, -30)).set(19, new FlatVec(0, -30)).set(20, new FlatVec(0, -30));
    const hb2OffSets = (/* @__PURE__ */ new Map()).set(15, new FlatVec(-5, -5)).set(16, new FlatVec(-8, -6)).set(17, new FlatVec(-10, -7)).set(18, new FlatVec(-12, -10)).set(19, new FlatVec(-9, -10)).set(20, new FlatVec(-7, -9));
    const hb3offSets = (/* @__PURE__ */ new Map()).set(15, new FlatVec(0, 15)).set(16, new FlatVec(0, 17)).set(17, new FlatVec(0, 20)).set(18, new FlatVec(0, 23)).set(19, new FlatVec(0, 21)).set(20, new FlatVec(0, 19));
    const bldr = new AttackBuilder("DAir").WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithGravity(true).WithTotalFrames(activeFrames).WithHitBubble(damage, radius, 0, launchAngle, hb1OffSets).WithHitBubble(damage, radius, 1, launchAngle, hb2OffSets).WithHitBubble(damage, radius, 2, launchAngle, hb3offSets);
    return bldr.Build();
  }
  function GetDownTilt() {
    const totalFrames = 33;
    const damage = 11;
    const launchAngle = 70;
    const radius = 27;
    const baseKnockBack = 20;
    const knockBackScaling = 30;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const hb2Offsets = /* @__PURE__ */ new Map();
    const hb3Offsets = /* @__PURE__ */ new Map();
    hb1Offsets.set(9, new FlatVec(110, -15)).set(10, new FlatVec(110, -15)).set(11, new FlatVec(110, -15)).set(12, new FlatVec(110, -15)).set(13, new FlatVec(110, -15)).set(14, new FlatVec(110, -15));
    hb2Offsets.set(9, new FlatVec(85, -10)).set(10, new FlatVec(85, -10)).set(11, new FlatVec(85, -10)).set(12, new FlatVec(85, -10)).set(13, new FlatVec(85, -10)).set(14, new FlatVec(85, -10));
    hb3Offsets.set(9, new FlatVec(50, -7)).set(10, new FlatVec(50, -7)).set(11, new FlatVec(50, -7)).set(12, new FlatVec(50, -7)).set(13, new FlatVec(50, -7)).set(14, new FlatVec(50, -7));
    const bldr = new AttackBuilder("DownTilt");
    bldr.WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithTotalFrames(totalFrames).WithGravity(true).WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets).WithHitBubble(damage - 1, radius, 1, launchAngle, hb2Offsets).WithHitBubble(damage - 2, radius, 2, launchAngle, hb3Offsets);
    return bldr.Build();
  }
  function GetSideTilt() {
    const totalFrames = 33;
    const damage = 12;
    const launchAngle = 40;
    const radius = 27;
    const baseKnockBack = 20;
    const knockBackScaling = 30;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const hb2Offsets = /* @__PURE__ */ new Map();
    const hb3Offsets = /* @__PURE__ */ new Map();
    hb1Offsets.set(9, new FlatVec(100, -40)).set(10, new FlatVec(100, -40)).set(11, new FlatVec(100, -40)).set(12, new FlatVec(100, -40)).set(13, new FlatVec(100, -40)).set(14, new FlatVec(100, -40));
    hb2Offsets.set(9, new FlatVec(60, -40)).set(10, new FlatVec(60, -40)).set(11, new FlatVec(60, -40)).set(12, new FlatVec(60, -40)).set(13, new FlatVec(60, -40)).set(14, new FlatVec(60, -40));
    hb3Offsets.set(9, new FlatVec(10, -40)).set(10, new FlatVec(10, -40)).set(11, new FlatVec(10, -40)).set(12, new FlatVec(10, -40)).set(13, new FlatVec(10, -40)).set(14, new FlatVec(10, -40));
    const bldr = new AttackBuilder("SideTilt");
    bldr.WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithTotalFrames(totalFrames).WithGravity(true).WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets).WithHitBubble(damage - 1, radius - 2, 1, launchAngle, hb2Offsets).WithHitBubble(damage - 2, radius - 4, 2, launchAngle, hb3Offsets);
    return bldr.Build();
  }
  function GetSideTiltDown() {
    const totalFrames = 33;
    const damage = 12;
    const launchAngle = 40;
    const radius = 27;
    const baseKnockBack = 20;
    const knockBackScaling = 30;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const hb2Offsets = /* @__PURE__ */ new Map();
    const hb3Offsets = /* @__PURE__ */ new Map();
    hb1Offsets.set(9, new FlatVec(100, -25)).set(10, new FlatVec(100, -25)).set(11, new FlatVec(100, -25)).set(12, new FlatVec(100, -25)).set(13, new FlatVec(100, -25)).set(14, new FlatVec(100, -25));
    hb2Offsets.set(9, new FlatVec(60, -32)).set(10, new FlatVec(60, -32)).set(11, new FlatVec(60, -32)).set(12, new FlatVec(60, -32)).set(13, new FlatVec(60, -32)).set(14, new FlatVec(60, -32));
    hb3Offsets.set(9, new FlatVec(10, -40)).set(10, new FlatVec(10, -40)).set(11, new FlatVec(10, -40)).set(12, new FlatVec(10, -40)).set(13, new FlatVec(10, -40)).set(14, new FlatVec(10, -40));
    const bldr = new AttackBuilder("SideTiltUp");
    bldr.WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithTotalFrames(totalFrames).WithGravity(true).WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets).WithHitBubble(damage - 1, radius - 2, 1, launchAngle, hb2Offsets).WithHitBubble(damage - 2, radius - 4, 2, launchAngle, hb3Offsets);
    return bldr.Build();
  }
  function GetSideTiltUp() {
    const totalFrames = 33;
    const damage = 12;
    const launchAngle = 40;
    const radius = 27;
    const baseKnockBack = 20;
    const knockBackScaling = 30;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const hb2Offsets = /* @__PURE__ */ new Map();
    const hb3Offsets = /* @__PURE__ */ new Map();
    hb1Offsets.set(9, new FlatVec(100, -65)).set(10, new FlatVec(100, -65)).set(11, new FlatVec(100, -65)).set(12, new FlatVec(100, -65)).set(13, new FlatVec(100, -65)).set(14, new FlatVec(100, -65));
    hb2Offsets.set(9, new FlatVec(60, -53)).set(10, new FlatVec(60, -53)).set(11, new FlatVec(60, -53)).set(12, new FlatVec(60, -53)).set(13, new FlatVec(60, -53)).set(14, new FlatVec(60, -53));
    hb3Offsets.set(9, new FlatVec(10, -40)).set(10, new FlatVec(10, -40)).set(11, new FlatVec(10, -40)).set(12, new FlatVec(10, -40)).set(13, new FlatVec(10, -40)).set(14, new FlatVec(10, -40));
    const bldr = new AttackBuilder("SideTiltUp");
    bldr.WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithTotalFrames(totalFrames).WithGravity(true).WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets).WithHitBubble(damage - 1, radius - 2, 1, launchAngle, hb2Offsets).WithHitBubble(damage - 2, radius - 4, 2, launchAngle, hb3Offsets);
    return bldr.Build();
  }
  function GetUpTilt() {
    const totalFrames = 60;
    const damage = 16;
    const launchAngle = 65;
    const nonExplsoiveRadius = 30;
    const explosiveRadius = 50;
    const BaseKnockBack = 30;
    const knockBackScaling = 45;
    const startAngle = 90 * Math.PI / 180;
    const endAngle = -315 * Math.PI / 180;
    const hitBubbleOffsets = generateArcBubbleOffsets(
      startAngle,
      endAngle,
      58,
      120,
      0,
      50,
      true
    );
    const hitBubbleOffsets2 = /* @__PURE__ */ new Map();
    hitBubbleOffsets2.set(59, new FlatVec(110, -40)).set(60, new FlatVec(110, -40));
    const bldr = new AttackBuilder("UpTilt");
    bldr.WithBaseKnockBack(BaseKnockBack).WithKnockBackScaling(knockBackScaling).WithGravity(true).WithTotalFrames(totalFrames).WithHitBubble(damage, nonExplsoiveRadius, 0, launchAngle, hitBubbleOffsets).WithHitBubble(
      damage * 2,
      explosiveRadius,
      1,
      launchAngle,
      hitBubbleOffsets2
    );
    return bldr.Build();
  }
  function GetUpcharge() {
    const totalFrames = 180;
    const bldr = new AttackBuilder("UpCharge").WithTotalFrames(totalFrames).WithGravity(true);
    return bldr.Build();
  }
  function GetUpchargeExt() {
    const totalFrames = 45;
    const damage = 20;
    const launchAngle = 75;
    const radius = 30;
    const baseKb = 25;
    const knockBackScaling = 35;
    const startAngle = 1 * Math.PI / 100;
    const endAngle = 50 * Math.PI / 100;
    const h1offset = generateArcBubbleOffsets(
      startAngle,
      endAngle,
      6,
      105,
      0,
      21
    );
    h1offset.forEach((v, k) => {
      v.Y -= 40;
    });
    const bldr = new AttackBuilder("UpChargeExtension");
    bldr.WithBaseKnockBack(baseKb).WithKnockBackScaling(knockBackScaling).WithGravity(true).WithTotalFrames(totalFrames).WithHitBubble(damage, radius, 0, launchAngle, h1offset);
    return bldr.Build();
  }
  function GetDownCharge() {
    const totalFrames = 180;
    const bldr = new AttackBuilder("DownCharge").WithTotalFrames(totalFrames).WithGravity(true);
    return bldr.Build();
  }
  function GetDownChargeExtension() {
    const totalFrames = 55;
    const damage = 15;
    const launchAngle = 90;
    const radius = 30;
    const baseKb = 35;
    const knockBackScaling = 15;
    const of1 = /* @__PURE__ */ new Map();
    const of2 = /* @__PURE__ */ new Map();
    const of3 = /* @__PURE__ */ new Map();
    const of4 = /* @__PURE__ */ new Map();
    const of5 = /* @__PURE__ */ new Map();
    const of6 = /* @__PURE__ */ new Map();
    const activeFrames = 9;
    const attackStart = 21;
    for (let i = 0; i < activeFrames; i++) {
      const frame = i + attackStart;
      if (i < 3) {
        of1.set(frame, new FlatVec(50, 0));
        of2.set(frame, new FlatVec(-50, 0));
      } else if (i < 6) {
        of3.set(frame, new FlatVec(70, 0));
        of4.set(frame, new FlatVec(-70, 0));
      } else if (i < 9) {
        of5.set(frame, new FlatVec(90, 0));
        of6.set(frame, new FlatVec(-90, 0));
      }
    }
    const bldr = new AttackBuilder("DownChargeExtension");
    bldr.WithBaseKnockBack(baseKb).WithKnockBackScaling(knockBackScaling).WithGravity(true).WithTotalFrames(totalFrames).WithHitBubble(damage, radius, 0, launchAngle, of1).WithHitBubble(damage, radius, 1, launchAngle, of2).WithHitBubble(damage, radius, 2, launchAngle, of3).WithHitBubble(damage, radius, 3, launchAngle, of4).WithHitBubble(damage, radius, 4, launchAngle, of5).WithHitBubble(damage, radius, 5, launchAngle, of6);
    return bldr.Build();
  }
  function GetSideCharge() {
    const totalFrames = 180;
    const bldr = new AttackBuilder("SideCharge").WithTotalFrames(totalFrames).WithGravity(true);
    return bldr.Build();
  }
  function GetSideChargeExtension() {
    const totalFrames = 60;
    const hb1Damage = 22;
    const hb2Damage = 20;
    const baseKnockBack = 30;
    const knockBackScaling = 45;
    const radius = 18;
    const hitBubbleOffsets1 = /* @__PURE__ */ new Map();
    const hitBubbleOffsets2 = /* @__PURE__ */ new Map();
    hitBubbleOffsets1.set(18, new FlatVec(-10, -40)).set(19, new FlatVec(10, -40)).set(20, new FlatVec(40, -40)).set(21, new FlatVec(65, -40)).set(22, new FlatVec(70, -40)).set(23, new FlatVec(70, -40));
    hitBubbleOffsets2.set(19, new FlatVec(0, -40)).set(20, new FlatVec(30, -40)).set(21, new FlatVec(55, -40)).set(22, new FlatVec(60, -40));
    const impulses = /* @__PURE__ */ new Map();
    impulses.set(20, new FlatVec(8, 0));
    const bldr = new AttackBuilder("SideChargeExtension").WithTotalFrames(totalFrames).WithImpulses(impulses, 10).WithGravity(true).WithHitBubble(hb1Damage, radius, 0, 50, hitBubbleOffsets1).WithHitBubble(hb2Damage, radius, 1, 50, hitBubbleOffsets2).WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling);
    return bldr.Build();
  }
  function GetSideSpecial() {
    const activeFrames = 80;
    const impulses = /* @__PURE__ */ new Map();
    const reactor = (w, sensorOwner, detectedPlayer) => {
      const sm = w.PlayerData.StateMachine(sensorOwner.ID);
      sm.UpdateFromWorld(GAME_EVENT_IDS.SIDE_SPCL_EX_GE);
    };
    const onEnter = (w, p) => {
      const vel = p.Velocity;
      vel.X = 0;
      p.Sensors.SetSensorReactor(reactor);
    };
    const onUpdate = (w, p, fN) => {
      if (fN === 15) {
        p.Sensors.ActivateSensor(-15, 45, 30).ActivateSensor(-50, 45, 30).ActivateSensor(-85, 45, 30);
      }
      if (fN === 40) {
        p.Sensors.DeactivateSensors();
      }
    };
    const onExit = (w, p) => {
      p.Sensors.DeactivateSensors();
    };
    impulses.set(5, new FlatVec(-6, 0)).set(6, new FlatVec(-3, 0));
    for (let i = 14; i < 35; i++) {
      impulses.set(i, new FlatVec(4, 0));
    }
    const bldr = new AttackBuilder("SideSpecial");
    bldr.WithUpdateAction(onUpdate).WithExitAction(onExit).WithEnterAction(onEnter).WithImpulses(impulses, 13).WithTotalFrames(activeFrames).WithGravity(false);
    return bldr.Build();
  }
  function GetSideSpecialExtension() {
    const totalFrameLength = 25;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const damage = 16;
    const radius = 40;
    const baseKnockBack = 30;
    const knockBackScaling = 45;
    hb1Offsets.set(3, new FlatVec(80, -50)).set(4, new FlatVec(90, -65)).set(5, new FlatVec(100, -85)).set(6, new FlatVec(65, -105)).set(7, new FlatVec(25, -125));
    const bldr = new AttackBuilder("SideSpecialExtension");
    bldr.WithTotalFrames(totalFrameLength).WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithEnterAction((w, p) => {
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    }).WithHitBubble(damage, radius, 0, 89, hb1Offsets);
    return bldr.Build();
  }
  function GetSideSpecialAir() {
    const activeFrames = 70;
    const impulses = /* @__PURE__ */ new Map();
    const reactor = (w, sensorOwner, detectedPlayer) => {
      const sm = w.PlayerData.StateMachine(sensorOwner.ID);
      sm.UpdateFromWorld(GAME_EVENT_IDS.S_SPCL_EX_AIR_GE);
    };
    const onEnter = (w, p) => {
      const vel = p.Velocity;
      vel.X = 0;
      vel.Y = 0;
      p.Sensors.SetSensorReactor(reactor);
    };
    const onUpdate = (w, p, fN) => {
      if (fN === 15) {
        p.Sensors.ActivateSensor(-15, 45, 30).ActivateSensor(-50, 45, 30).ActivateSensor(-85, 45, 30);
      }
      if (fN === 40) {
        p.Sensors.DeactivateSensors();
      }
    };
    const onExit = (w, p) => {
      p.Sensors.DeactivateSensors();
    };
    for (let i = 14; i < 35; i++) {
      impulses.set(i, new FlatVec(4, 0));
    }
    const bldr = new AttackBuilder("SideSpecialAir");
    bldr.WithUpdateAction(onUpdate).WithExitAction(onExit).WithEnterAction(onEnter).WithImpulses(impulses, 12).WithTotalFrames(activeFrames).WithGravity(false);
    return bldr.Build();
  }
  function GetSideSpecialExtensionAir() {
    const totalFrameLength = 25;
    const hb1Offsets = /* @__PURE__ */ new Map();
    const damage = 16;
    const radius = 40;
    const baseKnockBack = 30;
    const knockBackScaling = 45;
    const launchAngle = 270;
    hb1Offsets.set(3, new FlatVec(25, -125)).set(4, new FlatVec(65, -100)).set(5, new FlatVec(100, -75)).set(6, new FlatVec(90, -50)).set(7, new FlatVec(80, -35));
    const bldr = new AttackBuilder("SideSpecialExtensionAir");
    bldr.WithTotalFrames(totalFrameLength).WithBaseKnockBack(baseKnockBack).WithKnockBackScaling(knockBackScaling).WithEnterAction((w, p) => {
      p.Velocity.X = 0;
      p.Velocity.Y = 0;
    }).WithHitBubble(damage, radius, 0, launchAngle, hb1Offsets);
    return bldr.Build();
  }
  function GetDownSpecial() {
    const activeFrames = 77;
    const impulses = /* @__PURE__ */ new Map();
    const hb1OffSets = /* @__PURE__ */ new Map();
    const hb2OffSets = /* @__PURE__ */ new Map();
    const hb3offSets = /* @__PURE__ */ new Map();
    const hb4OffSets = /* @__PURE__ */ new Map();
    for (let i = 23; i < activeFrames; i++) {
      impulses.set(i, new FlatVec(2, 0));
      hb1OffSets.set(i, new FlatVec(100, -25));
      hb2OffSets.set(i, new FlatVec(70, -25));
      hb3offSets.set(i, new FlatVec(40, -25));
      if (i > 50) {
        hb4OffSets.set(i, new FlatVec(120, -25));
      }
    }
    const blrd = new AttackBuilder("DSpecial");
    blrd.WithBaseKnockBack(15).WithKnockBackScaling(66).WithGravity(false).WithTotalFrames(activeFrames).WithHitBubble(15, 20, 0, 45, hb1OffSets).WithHitBubble(13, 19, 1, 45, hb2OffSets).WithHitBubble(12, 18, 3, 45, hb3offSets).WithHitBubble(16, 25, 4, 45, hb4OffSets).WithImpulses(impulses, 12);
    return blrd.Build();
  }
  function generateArcBubbleOffsets(startAngle, endAngle, frames, distance, inwardRetract, frameStart = 12, invertY = true) {
    const offsets = /* @__PURE__ */ new Map();
    for (let i = 0; i < frames; i++) {
      const t = i / (frames - 1);
      const angle = startAngle + (endAngle - startAngle) * t;
      const retract = inwardRetract * t;
      const r = distance - retract;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      offsets.set(frameStart + i, new FlatVec(x, invertY ? -y : y));
    }
    return offsets;
  }

  // game/engine/player/playerOrchestrator.ts
  var Player = class {
    position;
    velocity;
    weight;
    flags;
    points;
    hitStun;
    hitStop;
    speeds;
    ecb;
    hurtCircles;
    jump;
    fsmInfo;
    ledgeDetector;
    sensors;
    attacks;
    ID = 0;
    constructor(Id, CharacterConfig) {
      const speedsBuilder = CharacterConfig.SCB;
      this.ID = Id;
      this.position = new PositionComponent();
      this.velocity = new VelocityComponent();
      this.weight = new WeightComponent(CharacterConfig.Weight);
      this.speeds = speedsBuilder.Build();
      this.flags = new PlayerFlagsComponent();
      this.points = new PlayerPointsComponent();
      this.hitStun = new HitStunComponent();
      this.hitStop = new HitStopComponent();
      this.ecb = new ECBComponent(
        CharacterConfig.ECBShapes,
        CharacterConfig.ECBHeight,
        CharacterConfig.ECBWidth,
        CharacterConfig.ECBOffset
      );
      this.hurtCircles = new HurtCapsulesComponent(CharacterConfig.HurtCapsules);
      this.jump = new JumpComponent(
        CharacterConfig.JumpVelocity,
        CharacterConfig.NumberOfJumps
      );
      this.fsmInfo = new FSMInfoComponent(CharacterConfig.FrameLengths);
      this.ledgeDetector = new LedgeDetectorComponent(
        this.position.X,
        this.position.Y,
        CharacterConfig.LedgeBoxWidth,
        CharacterConfig.LedgeBoxHeight,
        CharacterConfig.ledgeBoxYOffset
      );
      this.sensors = new SensorComponent();
      this.attacks = new AttackComponment(CharacterConfig.attacks);
    }
    get ECB() {
      return this.ecb;
    }
    get HurtBubbles() {
      return this.hurtCircles;
    }
    get Flags() {
      return this.flags;
    }
    get Points() {
      return this.points;
    }
    get HitStun() {
      return this.hitStun;
    }
    get HitStop() {
      return this.hitStop;
    }
    get Jump() {
      return this.jump;
    }
    get Position() {
      return this.position;
    }
    get Velocity() {
      return this.velocity;
    }
    get Weight() {
      return this.weight;
    }
    get Speeds() {
      return this.speeds;
    }
    get FSMInfo() {
      return this.fsmInfo;
    }
    get LedgeDetector() {
      return this.ledgeDetector;
    }
    get Sensors() {
      return this.sensors;
    }
    get Attacks() {
      return this.attacks;
    }
    CanFallOffLedgeWhenFacingIt() {
      const a = this.attacks.GetAttack();
      if (a === void 0) {
        return false;
      }
      return a.CanOnlyFallOffLedgeIfFacingAwayFromIt;
    }
    AddWalkImpulseToPlayer(impulse) {
      const velocity = this.velocity;
      const speeds = this.speeds;
      velocity.AddClampedXImpulse(
        speeds.MaxWalkSpeed,
        impulse * speeds.WalkSpeedMulitplier
      );
    }
    SetPlayerPosition(x, y) {
      const position = this.position;
      this.Position;
      position.X = x;
      position.Y = y;
      this.ecb.MoveToPosition(x, y);
      this.ledgeDetector.MoveTo(x, y);
    }
    AddToPlayerPosition(x, y) {
      const pos = this.position;
      pos.X += x;
      pos.Y += y;
      this.ecb.MoveToPosition(pos.X, pos.Y);
      this.ledgeDetector.MoveTo(pos.X, pos.Y);
    }
    AddToPlayerYPosition(y) {
      const position = this.position;
      position.Y += y;
      this.ecb.MoveToPosition(position.X, position.Y);
      this.ledgeDetector.MoveTo(position.X, position.Y);
    }
    SetPlayerInitialPosition(x, y) {
      this.Position.X = x;
      this.Position.Y = y;
      this.ecb.SetInitialPosition(x, y);
      this.ledgeDetector.MoveTo(x, y);
    }
  };
  function PlayerOnStage(s, ecbBottom, ecbSensorDepth) {
    const grnd = s.StageVerticies.GetGround();
    const grndLoopLength = grnd.length;
    for (let i = 0; i < grndLoopLength; i++) {
      const gP = grnd[i];
      if (LineSegmentIntersection(
        gP.X1,
        gP.Y1,
        gP.X2,
        gP.Y2,
        ecbBottom.X,
        ecbBottom.Y,
        ecbBottom.X,
        ecbBottom.Y - ecbSensorDepth
      )) {
        return true;
      }
    }
    return false;
  }
  function PlayerOnPlats(s, ecbBottom, ecbSensorDepth) {
    const plats = s.Platforms;
    if (plats === void 0) {
      return false;
    }
    const platLength = plats.length;
    for (let i = 0; i < platLength; i++) {
      const plat = plats[i];
      if (LineSegmentIntersection(
        ecbBottom.X,
        ecbBottom.Y,
        ecbBottom.X,
        ecbBottom.Y - ecbSensorDepth,
        plat.X1,
        plat.Y1,
        plat.X2,
        plat.Y2
      )) {
        return true;
      }
    }
    return false;
  }
  function PlayerOnPlatsReturnsYCoord(s, ecbBottom, ecbSensorDepth) {
    const plats = s.Platforms;
    if (plats === void 0) {
      return void 0;
    }
    const platLength = plats.length;
    for (let i = 0; i < platLength; i++) {
      const plat = plats[i];
      if (LineSegmentIntersection(
        ecbBottom.X,
        ecbBottom.Y,
        ecbBottom.X,
        ecbBottom.Y - ecbSensorDepth,
        plat.X1,
        plat.Y1,
        plat.X2,
        plat.Y2
      )) {
        return plat.Y1;
      }
    }
    return void 0;
  }
  function PlayerOnStageOrPlats(s, ecbBottom, ecbSensorDepth) {
    if (PlayerOnPlats(s, ecbBottom, ecbSensorDepth)) {
      return true;
    }
    return PlayerOnStage(s, ecbBottom, ecbSensorDepth);
  }

  // game/engine/stage/stageMain.ts
  function defaultStage() {
    const sv = new StageVerticies();
    const groundPecies = sv.GetGround();
    const grndStart = groundPecies[0];
    const grndEnd = groundPecies[groundPecies.length - 1];
    const topLeftX = grndStart.X1;
    const topLeftY = grndStart.Y1;
    const topRightX = grndEnd.X2;
    const topRighty = grndEnd.Y2;
    const leftLedgePoint = new FlatVec(topLeftX, topLeftY);
    const rightLedgePoint = new FlatVec(topRightX, topRighty);
    const sl = new Ledges(leftLedgePoint, rightLedgePoint);
    const db = new DeathBoundry(-100, 1180, -100, 2020);
    const plats = new Array();
    plats.push(
      new Line(950, 300, 1150, 300),
      new Line(700, 475, 900, 475),
      new Line(1200, 475, 1400, 475)
    );
    return new Stage(sv, sl, db, plats);
  }
  var Stage = class {
    StageVerticies;
    Ledges;
    DeathBoundry;
    Platforms;
    constructor(sv, sl, db, pl) {
      this.StageVerticies = sv;
      this.Ledges = sl;
      this.DeathBoundry = db;
      this.Platforms = pl;
    }
  };
  var StageVerticies = class {
    Verts = new Array();
    Ground;
    leftWall;
    RightWall;
    Ceiling;
    constructor() {
      const groundPeices = [new Line(500, 650, 1600, 650)];
      const leftFacingWalls = [new Line(500, 650, 500, 700)];
      const rightFacingWalls = [new Line(1600, 650, 1600, 700)];
      const ceilingPeices = [new Line(500, 700, 1600, 700)];
      this.Ground = groundPeices;
      this.leftWall = leftFacingWalls;
      this.RightWall = rightFacingWalls;
      this.Ceiling = ceilingPeices;
      const pushFunc = (l) => {
        const start2 = new FlatVec(l.X1, l.Y1);
        const end = new FlatVec(l.X2, l.Y2);
        if (VertArrayContainsFlatVec(this.Verts, start2) === false) {
          this.Verts.push(start2);
        }
        if (VertArrayContainsFlatVec(this.Verts, end) === false) {
          this.Verts.push(end);
        }
      };
      this.Ground.forEach(pushFunc);
      this.RightWall.forEach(pushFunc);
      this.Ceiling.forEach(pushFunc);
      this.leftWall.forEach(pushFunc);
    }
    GetVerts() {
      return this.Verts;
    }
    GetGround() {
      return this.Ground;
    }
    GetLeftWall() {
      return this.leftWall;
    }
    GetRightWall() {
      return this.RightWall;
    }
    GetCeiling() {
      return this.Ceiling;
    }
  };
  var Ledges = class {
    leftLedge;
    rightLedge;
    constructor(topLeft, topRight, width = 50, height = 20) {
      const leftLedge = [];
      const rightLedge = [];
      leftLedge.push(topLeft);
      leftLedge.push(new FlatVec(topLeft.X + width, topLeft.Y));
      leftLedge.push(new FlatVec(topLeft.X + width, topLeft.Y + height));
      leftLedge.push(new FlatVec(topLeft.X, topLeft.Y + height));
      rightLedge.push(topRight);
      rightLedge.push(new FlatVec(topRight.X, topRight.Y + height));
      rightLedge.push(new FlatVec(topRight.X - width, topRight.Y + height));
      rightLedge.push(new FlatVec(topRight.X - width, topRight.Y));
      this.leftLedge = leftLedge;
      this.rightLedge = rightLedge;
    }
    GetLeftLedge() {
      return this.leftLedge;
    }
    GetRightLedge() {
      return this.rightLedge;
    }
  };
  var DeathBoundry = class {
    topBoundry;
    bottomBoundry;
    leftBoundry;
    rightBoundry;
    constructor(t, b, l, r) {
      this.topBoundry = t;
      this.bottomBoundry = b;
      this.leftBoundry = l;
      this.rightBoundry = r;
    }
  };

  // game/engine/systems/systems.ts
  var correctionDepth = 0.1;
  var cornerJitterCorrection = 2;
  var hardLandVelocty = 8;
  function StageCollisionDetection(playerData, stageData, pools) {
    const playerCount = playerData.PlayerCount;
    const stage = stageData.Stage;
    const stageVerts = stage.StageVerticies.GetVerts();
    const stageGround = stage.StageVerticies.GetGround();
    const leftMostPiece = stageGround[0];
    const rightMostPiece = stageGround[stageGround.length - 1];
    const leftStagePoint = pools.VecPool.Rent().SetXY(
      leftMostPiece.X1,
      leftMostPiece.Y1
    );
    const rightStagePoint = pools.VecPool.Rent().SetXY(
      rightMostPiece.X2,
      rightMostPiece.Y2
    );
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const sm = playerData.StateMachine(playerIndex);
      const ecb = p.ECB;
      const playerVerts = ecb.GetHull();
      const fsmIno = p.FSMInfo;
      const preResolutionStateId = fsmIno.CurrentStatetId;
      const preResolutionYOffset = ecb.YOffset;
      const playerOnPlats = PlayerOnPlats(stage, ecb.Bottom, ecb.SensorDepth);
      if (playerOnPlats) {
        continue;
      }
      const collisionResult = IntersectsPolygons(
        playerVerts,
        stageVerts,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool
      );
      if (collisionResult.Collision) {
        const normalX = collisionResult.NormX;
        const normalY = collisionResult.NormY;
        const move = pools.VecPool.Rent().SetXY(normalX, normalY).Negate().Multiply(collisionResult.Depth);
        if (normalX === 0 && normalY > 0) {
          move.AddToY(correctionDepth);
        } else if (normalX > 0 && normalY === 0) {
          move.AddToX(correctionDepth);
        } else if (normalX < 0 && normalY === 0) {
          move.AddToX(-correctionDepth);
        } else if (normalX === 0 && normalY < 0) {
          move.AddToY(-correctionDepth);
        } else if (Math.abs(normalX) > 0 && normalY < 0) {
          move.AddToX(move.X <= 0 ? move.Y : -move.Y);
        }
        p.AddToPlayerPosition(move.X, move.Y);
      }
      const onStage = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
      const standingOnLeftLedge = Math.abs(p.Position.X - leftStagePoint.X) <= cornerJitterCorrection;
      const standingOnRightLedge = Math.abs(p.Position.X - rightStagePoint.X) <= cornerJitterCorrection;
      if (standingOnLeftLedge && onStage) {
        p.SetPlayerPosition(
          leftStagePoint.X + cornerJitterCorrection,
          p.Position.Y
        );
      } else if (standingOnRightLedge && onStage) {
        p.SetPlayerPosition(
          rightStagePoint.X - cornerJitterCorrection,
          p.Position.Y
        );
      }
      const grnd = PlayerOnStage(stage, p.ECB.Bottom, p.ECB.SensorDepth);
      const prvGrnd = PlayerOnStage(stage, p.ECB.PrevBottom, p.ECB.SensorDepth);
      const canWalkOffStage = CanStateWalkOffLedge(p.FSMInfo.CurrentStatetId);
      if (grnd === false && prvGrnd === true && canWalkOffStage === false) {
        const position = p.Position;
        if (Math.abs(position.X - leftStagePoint.X) < Math.abs(position.X - rightStagePoint.X)) {
          p.SetPlayerPosition(
            leftStagePoint.X + cornerJitterCorrection,
            leftStagePoint.Y
          );
        } else {
          p.SetPlayerPosition(
            rightStagePoint.X - cornerJitterCorrection,
            rightStagePoint.Y
          );
        }
        sm.UpdateFromWorld(GAME_EVENT_IDS.LAND_GE);
        continue;
      }
      if (grnd === false && p.FSMInfo.CurrentStatetId != STATE_IDS.LEDGE_GRAB_S) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
        continue;
      }
      if (grnd === true && collisionResult.Collision) {
        sm.UpdateFromWorld(
          shouldSoftland(p.Velocity.Y) ? GAME_EVENT_IDS.SOFT_LAND_GE : GAME_EVENT_IDS.LAND_GE
        );
      }
      if (preResolutionStateId !== STATE_IDS.LAND_S && preResolutionStateId !== STATE_IDS.SOFT_LAND_S && (fsmIno.CurrentStatetId === STATE_IDS.LAND_S || fsmIno.CurrentStatetId === STATE_IDS.SOFT_LAND_S)) {
        p.AddToPlayerYPosition(preResolutionYOffset);
      }
    }
  }
  function shouldSoftland(yVelocity) {
    return yVelocity < hardLandVelocty;
  }
  function PlatformDetection(playerData, stageData, currentFrame) {
    const plats = stageData.Stage.Platforms;
    if (plats === void 0) {
      return;
    }
    const playerCount = playerData.PlayerCount;
    const platCount = plats.length;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const flags = p.Flags;
      if (flags.IsPlatDetectDisabled) {
        continue;
      }
      const velocity = p.Velocity;
      if (velocity.Y < 0) {
        continue;
      }
      const inputStore = playerData.InputStore(playerIndex);
      const ia = inputStore.GetInputForFrame(currentFrame);
      const prevIa = inputStore.GetInputForFrame(currentFrame - 1);
      const ecb = p.ECB;
      const yCoord = PlayerOnPlatsReturnsYCoord(
        stageData.Stage,
        ecb.Bottom,
        ecb.SensorDepth
      );
      if (yCoord != void 0) {
        const sm = playerData.StateMachine(playerIndex);
        const checkValue = -(prevIa.LYAxis - ia.LYAxis);
        if (checkValue <= -0.5) {
          sm.UpdateFromWorld(GAME_EVENT_IDS.FALL_GE);
          flags.SetDisablePlatFrames(11);
          continue;
        }
        const landId = shouldSoftland(velocity.Y) ? GAME_EVENT_IDS.SOFT_LAND_GE : GAME_EVENT_IDS.LAND_GE;
        sm.UpdateFromWorld(landId);
        const newYOffset = ecb.YOffset;
        p.SetPlayerPosition(ecb.Bottom.X, yCoord + correctionDepth - newYOffset);
        continue;
      }
      const fsmInfo = p.FSMInfo;
      if (ia.LYAxis < -0.5 && fsmInfo.CurrentStatetId !== STATE_IDS.AIR_DODGE_S) {
        continue;
      }
      const previousBottom = ecb.PrevBottom;
      const currentBottom = ecb.Bottom;
      for (let platIndex = 0; platIndex < platCount; platIndex++) {
        const plat = plats[platIndex];
        const intersected = LineSegmentIntersection(
          previousBottom.X,
          previousBottom.Y,
          currentBottom.X,
          currentBottom.Y,
          plat.X1,
          plat.Y1,
          plat.X2,
          plat.Y2
        );
        if (intersected === false) {
          continue;
        }
        const playerIsTooFarRight = currentBottom.X > plat.X2;
        const playerIsTooFarLeft = currentBottom.X < plat.X1;
        if (playerIsTooFarRight) {
          const landId2 = shouldSoftland(velocity.Y) ? GAME_EVENT_IDS.SOFT_LAND_GE : GAME_EVENT_IDS.LAND_GE;
          playerData.StateMachine(playerIndex).UpdateFromWorld(landId2);
          const newYOffset2 = ecb.YOffset;
          const desiredPlayerY2 = plat.Y1 + correctionDepth - newYOffset2;
          p.SetPlayerPosition(plat.X2, desiredPlayerY2);
          break;
        }
        if (playerIsTooFarLeft) {
          const landId2 = shouldSoftland(velocity.Y) ? GAME_EVENT_IDS.SOFT_LAND_GE : GAME_EVENT_IDS.LAND_GE;
          playerData.StateMachine(playerIndex).UpdateFromWorld(landId2);
          const newYOffset2 = ecb.YOffset;
          const desiredPlayerY2 = plat.Y1 + correctionDepth - newYOffset2;
          p.SetPlayerPosition(plat.X1, desiredPlayerY2);
          break;
        }
        const landId = shouldSoftland(velocity.Y) ? GAME_EVENT_IDS.SOFT_LAND_GE : GAME_EVENT_IDS.LAND_GE;
        playerData.StateMachine(playerIndex).UpdateFromWorld(landId);
        const newYOffset = ecb.YOffset;
        const desiredPlayerY = plat.Y2 + correctionDepth - newYOffset;
        p.SetPlayerPosition(currentBottom.X, desiredPlayerY);
      }
    }
  }
  function LedgeGrabDetection(playerData, stageData, pools) {
    const stage = stageData.Stage;
    const ledges = stage.Ledges;
    const leftLedge = ledges.GetLeftLedge();
    const rightLedge = ledges.GetRightLedge();
    const playerCount = playerData.PlayerCount;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      if (p.Flags.IsInHitPause) {
        continue;
      }
      const ledgeDetector = p.LedgeDetector;
      if (ledgeDetector.CanGrabLedge === false) {
        continue;
      }
      const sm = playerData.StateMachine(playerIndex);
      const flags = p.Flags;
      const ecb = p.ECB;
      if (p.Velocity.Y < 0 || p.FSMInfo.CurrentStatetId === STATE_IDS.JUMP_S) {
        continue;
      }
      if (PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth)) {
        continue;
      }
      const isFacingRight = flags.IsFacingRight;
      const front = isFacingRight === true ? ledgeDetector.RightSide : ledgeDetector.LeftSide;
      if (isFacingRight) {
        const intersectsLeftLedge = IntersectsPolygons(
          leftLedge,
          front,
          pools.VecPool,
          pools.ColResPool,
          pools.ProjResPool
        );
        if (intersectsLeftLedge.Collision) {
          sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
          p.SetPlayerPosition(leftLedge[0].X - ecb.Width / 2, p.Position.Y);
        }
        continue;
      }
      const intersectsRightLedge = IntersectsPolygons(
        rightLedge,
        front,
        pools.VecPool,
        pools.ColResPool,
        pools.ProjResPool
      );
      if (intersectsRightLedge.Collision) {
        sm.UpdateFromWorld(GAME_EVENT_IDS.LEDGE_GRAB_GE);
        p.SetPlayerPosition(rightLedge[0].X + ecb.Width / 2, p.Position.Y);
      }
    }
  }
  function PlayerCollisionDetection(playerData, pools) {
    const playerCount = playerData.PlayerCount;
    if (playerCount < 2) {
      return;
    }
    for (let pIOuter = 0; pIOuter < playerCount; pIOuter++) {
      const checkPlayer = playerData.Player(pIOuter);
      const checkPlayerStateId = checkPlayer.FSMInfo.CurrentState.StateId;
      if (checkPlayerStateId === STATE_IDS.LEDGE_GRAB_S || checkPlayer.Flags.IsInHitPause) {
        continue;
      }
      const checkPlayerEcb = checkPlayer.ECB.GetActiveVerts();
      for (let pIInner = pIOuter + 1; pIInner < playerCount; pIInner++) {
        const otherPlayer = playerData.Player(pIInner);
        const otherPlayerStateId = otherPlayer.FSMInfo.CurrentState.StateId;
        if (otherPlayerStateId === STATE_IDS.LEDGE_GRAB_S || otherPlayer.Flags.IsInHitPause) {
          continue;
        }
        const otherPlayerEcb = otherPlayer.ECB.GetActiveVerts();
        const collision = IntersectsPolygons(
          checkPlayerEcb,
          otherPlayerEcb,
          pools.VecPool,
          pools.ColResPool,
          pools.ProjResPool
        );
        if (collision.Collision) {
          const checkPlayerPos = checkPlayer.Position;
          const otherPlayerPos = otherPlayer.Position;
          const checkPlayerX = checkPlayerPos.X;
          const checkPlayerY = checkPlayerPos.Y;
          const otherPlayerX = otherPlayerPos.X;
          const otherPlayerY = otherPlayerPos.Y;
          const moveX = 1.5;
          if (checkPlayerX >= otherPlayerX) {
            checkPlayer.SetPlayerPosition(checkPlayerX + moveX / 2, checkPlayerY);
            otherPlayer.SetPlayerPosition(otherPlayerX - moveX / 2, otherPlayerY);
            continue;
          }
          checkPlayer.SetPlayerPosition(checkPlayerX - moveX / 2, checkPlayerY);
          otherPlayer.SetPlayerPosition(otherPlayerX + moveX / 2, otherPlayerY);
        }
      }
    }
  }
  function Gravity(playerData, stageData) {
    const playerCount = playerData.PlayerCount;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const stage = stageData.Stage;
      if (p.Flags.IsInHitPause === true || playerHasGravity(p, stage) === false) {
        continue;
      }
      const speeds = p.Speeds;
      const grav = speeds.Gravity;
      const isFF = p.Flags.IsFastFalling;
      const fallSpeed = isFF ? speeds.FastFallSpeed : speeds.FallSpeed;
      const GravMutliplier = isFF ? 2 : 1;
      p.Velocity.AddClampedYImpulse(fallSpeed, grav * GravMutliplier);
    }
  }
  function playerHasGravity(p, stage) {
    switch (p.FSMInfo.CurrentStatetId) {
      case STATE_IDS.AIR_DODGE_S:
        return false;
      case STATE_IDS.LEDGE_GRAB_S:
        return false;
      case STATE_IDS.HIT_STOP_S:
        return false;
      default:
        break;
    }
    if (p.Flags.IsInHitPause) {
      return false;
    }
    const ecb = p.ECB;
    const attack = p.Attacks.GetAttack();
    if (attack === void 0) {
      return !PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth);
    }
    if (attack.GravityActive === false) {
      return false;
    }
    return !PlayerOnStageOrPlats(stage, ecb.Bottom, ecb.SensorDepth);
  }
  function PlayerInput(playerData, world) {
    const playerCount = playerData.PlayerCount;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      if (p.Flags.IsInHitPause) {
        continue;
      }
      const input = world.PlayerData.InputStore(playerIndex).GetInputForFrame(
        world.localFrame
      );
      playerData.StateMachine(playerIndex).UpdateFromInput(input, world);
    }
  }
  function PlayerSensors(world, playerData, pools) {
    const playerCount = playerData.PlayerCount;
    if (playerCount < 2) {
      return;
    }
    for (let outerIdx = 0; outerIdx < playerCount - 1; outerIdx++) {
      const pA = playerData.Player(outerIdx);
      for (let innerIdx = outerIdx + 1; innerIdx < playerCount; innerIdx++) {
        const pB = playerData.Player(innerIdx);
        const pAVspB = sesnsorDetect(
          pA,
          pB,
          pools.VecPool,
          pools.ColResPool,
          pools.ClstsPntsResPool
        );
        const pBVspA = sesnsorDetect(
          pB,
          pA,
          pools.VecPool,
          pools.ColResPool,
          pools.ClstsPntsResPool
        );
        if (pAVspB) {
          pA.Sensors.ReactAction(world, pA, pB);
        }
        if (pBVspA) {
          pB.Sensors.ReactAction(world, pB, pB);
        }
      }
    }
  }
  function sesnsorDetect(pA, pB, vecPool, colResPool, closestPointsPool) {
    const pASensors = pA.Sensors;
    const pAPos = pA.Position;
    const pBPos = pB.Position;
    const pBHurtCaps = pB.HurtBubbles.HurtCapsules;
    const pAFacingRight = pA.Flags.IsFacingRight;
    const pBCapsLenght = pBHurtCaps.length;
    const sesnsorLength = pASensors.NumberActive;
    for (let hurtCapIndex = 0; hurtCapIndex < pBCapsLenght; hurtCapIndex++) {
      const pBHurtCap = pBHurtCaps[hurtCapIndex];
      const hurtCapStart = pBHurtCap.GetStartPosition(pBPos.X, pBPos.Y, vecPool);
      const hurtCapEnd = pBHurtCap.GetEndPosition(pBPos.X, pBPos.Y, vecPool);
      for (let sensorIndex = 0; sensorIndex < sesnsorLength; sensorIndex++) {
        const sensor = pASensors.Sensors[sensorIndex];
        if (sensor.IsActive === false) {
          continue;
        }
        const sensorPostion = sensor.GetGlobalPosition(
          vecPool,
          pAPos.X,
          pAPos.Y,
          pAFacingRight
        );
        const closestPoints = ClosestPointsBetweenSegments(
          sensorPostion,
          sensorPostion,
          hurtCapStart,
          hurtCapEnd,
          vecPool,
          closestPointsPool
        );
        const testPoint1 = vecPool.Rent().SetXY(closestPoints.C1X, closestPoints.C1Y);
        const testPoint2 = vecPool.Rent().SetXY(closestPoints.C2X, closestPoints.C2Y);
        const collisionResult = IntersectsCircles(
          colResPool,
          testPoint1,
          testPoint2,
          sensor.Radius,
          pBHurtCap.Radius
        );
        if (collisionResult.Collision) {
          return true;
        }
      }
    }
    return false;
  }
  function PlayerAttacks(playerData, historyData, pools, currentFrame) {
    const playerCount = playerData.PlayerCount;
    if (playerCount === 1) {
      return;
    }
    for (let outerPIdx = 0; outerPIdx < playerCount - 1; outerPIdx++) {
      const p1 = playerData.Player(outerPIdx);
      for (let innerPIdx = outerPIdx + 1; innerPIdx < playerCount; innerPIdx++) {
        const p2 = playerData.Player(innerPIdx);
        const p1HitsP2Result = PAvsPB(
          currentFrame,
          pools.ActiveHitBubbleDtoPool,
          pools.AtkResPool,
          pools.VecPool,
          pools.ColResPool,
          pools.ClstsPntsResPool,
          historyData.PlayerComponentHistories,
          p1,
          p2
        );
        const p2HitsP1Result = PAvsPB(
          currentFrame,
          pools.ActiveHitBubbleDtoPool,
          pools.AtkResPool,
          pools.VecPool,
          pools.ColResPool,
          pools.ClstsPntsResPool,
          historyData.PlayerComponentHistories,
          p2,
          p1
        );
        if (p1HitsP2Result.Hit && p2HitsP1Result.Hit) {
          const clang = Math.abs(p1HitsP2Result.Damage - p2HitsP1Result.Damage) < 3;
        }
        if (p1HitsP2Result.Hit) {
          resolveHitResult(p1, p2, playerData, p1HitsP2Result, pools.VecPool);
        }
        if (p2HitsP1Result.Hit) {
          resolveHitResult(p2, p1, playerData, p2HitsP1Result, pools.VecPool);
        }
      }
    }
  }
  function resolveHitResult(pA, pB, pAlayerData, pAHitsPbResult, vecPool) {
    const damage = pAHitsPbResult.Damage;
    pB.Points.AddDamage(damage);
    const kb = CalculateKnockback(pB, pAHitsPbResult);
    const hitStop = CalculateHitStop(damage);
    const hitStunFrames = CalculateHitStun(kb);
    const launchVec = CalculateLaunchVector(
      vecPool,
      pAHitsPbResult,
      pA.Flags.IsFacingRight,
      kb
    );
    pA.Flags.SetHitPauseFrames(Math.floor(hitStop * 0.75));
    if (pA.Position.X > pB.Position.X) {
      pB.Flags.FaceRight();
    } else {
      pB.Flags.FaceLeft();
    }
    pB.HitStop.SetHitStop(hitStop);
    pB.HitStun.SetHitStun(hitStunFrames, launchVec.X, launchVec.Y);
    const pBSm = pAlayerData.StateMachine(pB.ID);
    pBSm.UpdateFromWorld(GAME_EVENT_IDS.HIT_STOP_GE);
  }
  function PAvsPB(currentFrame, activeHbPool, atkResPool, vecPool, colResPool, clstsPntsResPool, componentHistories, pA, pB) {
    const pAstateFrame = pA.FSMInfo.CurrentStateFrame;
    const pAAttack = pA.Attacks.GetAttack();
    if (pAAttack === void 0) {
      return atkResPool.Rent();
    }
    if (pAAttack.HasHitPlayer(pB.ID)) {
      return atkResPool.Rent();
    }
    const pAHitBubbles = pAAttack.GetActiveHitBubblesForFrame(
      pAstateFrame,
      activeHbPool.Rent()
    );
    if (pAHitBubbles.Length === 0) {
      return atkResPool.Rent();
    }
    const pBHurtBubbles = pB.HurtBubbles.HurtCapsules;
    const hurtLength = pBHurtBubbles.length;
    const hitLength = pAHitBubbles.Length;
    for (let hurtIndex = 0; hurtIndex < hurtLength; hurtIndex++) {
      const pBHurtBubble = pBHurtBubbles[hurtIndex];
      for (let hitIndex = 0; hitIndex < hitLength; hitIndex++) {
        const pAHitBubble = pAHitBubbles.AtIndex(hitIndex);
        const pAPositionHistory = componentHistories[pA.ID].PositionHistory;
        const previousWorldFrame = currentFrame - 1 < 0 ? 0 : currentFrame - 1;
        const pAPrevPositionDto = vecPool.Rent().SetFromFlatVec(pAPositionHistory[previousWorldFrame]);
        const pACurPositionDto = vecPool.Rent().SetXY(pA.Position.X, pA.Position.Y);
        const currentStateFrame = pAstateFrame;
        const pAFacingRight = pA.Flags.IsFacingRight;
        const pAhitBubbleCurrentPos = pAHitBubble?.GetGlobalPosition(
          vecPool,
          pACurPositionDto.X,
          pACurPositionDto.Y,
          pAFacingRight,
          currentStateFrame
        );
        if (pAhitBubbleCurrentPos === void 0) {
          continue;
        }
        let pAHitBubblePreviousPos = pAHitBubble?.GetGlobalPosition(
          vecPool,
          pAPrevPositionDto.X,
          pAPrevPositionDto.Y,
          pAFacingRight,
          currentStateFrame - 1 < 0 ? 0 : currentStateFrame - 1
        ) ?? vecPool.Rent().SetXY(pAhitBubbleCurrentPos.X, pAhitBubbleCurrentPos.Y);
        const pBPosition = pB.Position;
        const pBStartHurtDto = pBHurtBubble.GetStartPosition(
          pBPosition.X,
          pBPosition.Y,
          vecPool
        );
        const pBEndHurtDto = pBHurtBubble.GetEndPosition(
          pBPosition.X,
          pBPosition.Y,
          vecPool
        );
        const pointsToTest = ClosestPointsBetweenSegments(
          pAHitBubblePreviousPos,
          pAhitBubbleCurrentPos,
          pBStartHurtDto,
          pBEndHurtDto,
          vecPool,
          clstsPntsResPool
        );
        const pARadius = pAHitBubble.Radius;
        const pBRadius = pBHurtBubble.Radius;
        const testPoint1 = vecPool.Rent().SetXY(pointsToTest.C1X, pointsToTest.C1Y);
        const testPoint2 = vecPool.Rent().SetXY(pointsToTest.C2X, pointsToTest.C2Y);
        const collision = IntersectsCircles(
          colResPool,
          testPoint1,
          testPoint2,
          pARadius,
          pBRadius
        );
        if (collision.Collision) {
          pAAttack.HitPlayer(pB.ID);
          let attackResult = atkResPool.Rent();
          attackResult.SetTrue(
            pB.ID,
            pAHitBubble.Damage,
            pAHitBubble.Priority,
            collision.NormX,
            collision.NormY,
            collision.Depth,
            pAAttack.BaseKnockBack,
            pAAttack.KnockBackScaling,
            pAHitBubble.launchAngle
          );
          return attackResult;
        }
      }
    }
    return atkResPool.Rent();
  }
  function CalculateHitStop(damage) {
    return Math.floor(damage / 3 + 3);
  }
  function CalculateHitStun(knockBack) {
    return Math.ceil(knockBack) * 0.4;
  }
  function CalculateLaunchVector(vecPool, attackRes, isFacingRight, knockBack) {
    const vec = vecPool.Rent();
    let angleInRadians = attackRes.LaunchAngle * (Math.PI / 180);
    if (isFacingRight === false) {
      angleInRadians = Math.PI - angleInRadians;
    }
    return vec.SetXY(
      Math.cos(angleInRadians) * knockBack,
      -(Math.sin(angleInRadians) * knockBack) / 2
    );
  }
  function CalculateKnockback(player, attackRes) {
    const p = player.Points.Damage;
    const d = attackRes.Damage;
    const w = player.Weight.Weight;
    const s = attackRes.KnockBackScaling;
    const b = attackRes.BaseKnockBack;
    return ((p / 10 + p * d / 20) * (200 / (w + 100)) * 1.4 + b) * s * 0.013;
  }
  function ApplyVelocty(playerData) {
    const playerCount = playerData.PlayerCount;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      if (p.Flags.IsInHitPause) {
        continue;
      }
      const playerVelocity = p.Velocity;
      p.AddToPlayerPosition(playerVelocity.X, playerVelocity.Y);
    }
  }
  function ApplyVeloctyDecay(playerData, stageData) {
    const playerCount = playerData.PlayerCount;
    const stage = stageData.Stage;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const flags = p.Flags;
      if (flags.IsInHitPause) {
        continue;
      }
      const grounded = PlayerOnStageOrPlats(
        stage,
        p.ECB.Bottom,
        p.ECB.SensorDepth
      );
      const playerVelocity = p.Velocity;
      const pvx = playerVelocity.X;
      const pvy = playerVelocity.Y;
      const speeds = p.Speeds;
      const absPvx = Math.abs(pvx);
      if (grounded) {
        const groundedVelocityDecay = speeds.GroundedVelocityDecay;
        if (pvx > 0) {
          playerVelocity.X -= groundedVelocityDecay;
        } else if (pvx < 0) {
          playerVelocity.X += groundedVelocityDecay;
        }
        if (absPvx < 1) {
          playerVelocity.X = 0;
        }
        if (pvy > 0) {
          playerVelocity.Y = 0;
        }
        continue;
      }
      const aerialVelocityDecay = speeds.AerialVelocityDecay;
      const fallSpeed = p.Flags.IsFastFalling ? speeds.FastFallSpeed : speeds.FallSpeed;
      if (pvx > 0) {
        playerVelocity.X -= aerialVelocityDecay;
      } else if (pvx < 0) {
        playerVelocity.X += aerialVelocityDecay;
      }
      if (pvy > fallSpeed) {
        playerVelocity.Y -= aerialVelocityDecay;
      }
      if (pvy < 0) {
        playerVelocity.Y += aerialVelocityDecay;
      }
      if (absPvx < 1.5) {
        playerVelocity.X = 0;
      }
    }
  }
  function TimedFlags(playerData) {
    const playerCount = playerData.PlayerCount;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const flags = p.Flags;
      if (flags.IsInHitPause) {
        flags.DecrementHitPause();
      }
      if (flags.IsIntangible) {
        flags.DecrementIntangabilityFrames();
      }
      if (flags.IsPlatDetectDisabled) {
        flags.DecrementDisablePlatDetection();
      }
    }
  }
  function OutOfBoundsCheck(playerData, stageData) {
    const playerCount = playerData.PlayerCount;
    const stage = stageData.Stage;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const sm = playerData.StateMachine(playerIndex);
      const pPos = p.Position;
      const pY = pPos.Y;
      const pX = pPos.X;
      const deathBoundry = stage.DeathBoundry;
      if (pY < deathBoundry.topBoundry) {
        KillPlayer(p, sm);
        return;
      }
      if (pY > deathBoundry.bottomBoundry) {
        KillPlayer(p, sm);
        return;
      }
      if (pX < deathBoundry.leftBoundry) {
        KillPlayer(p, sm);
        return;
      }
      if (pX > deathBoundry.rightBoundry) {
        KillPlayer(p, sm);
        return;
      }
    }
  }
  function KillPlayer(p, sm) {
    p.SetPlayerInitialPosition(610, 300);
    p.Jump.ResetJumps();
    p.Jump.IncrementJumps();
    p.Velocity.X = 0;
    p.Velocity.Y = 0;
    p.Points.SubtractMatchPoints(1);
    p.Points.ResetDamagePoints();
    p.Flags.FastFallOff();
    p.Flags.ZeroIntangabilityFrames();
    p.Flags.ZeroHitPauseFrames();
    sm.ForceState(STATE_IDS.N_FALL_S);
  }
  function RecordHistory(w, playerData, historyData, frameNumber) {
    const playerCount = playerData.PlayerCount;
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      const p = playerData.Player(playerIndex);
      const history = historyData.PlayerComponentHistories[playerIndex];
      history.PositionHistory[frameNumber] = p.Position.SnapShot();
      history.FsmInfoHistory[frameNumber] = p.FSMInfo.SnapShot();
      history.PlayerPointsHistory[frameNumber] = p.Points.SnapShot();
      history.VelocityHistory[frameNumber] = p.Velocity.SnapShot();
      history.FlagsHistory[frameNumber] = p.Flags.SnapShot();
      history.PlayerHitStopHistory[frameNumber] = p.HitStop.SnapShot();
      history.PlayerHitStunHistory[frameNumber] = p.HitStun.SnapShot();
      history.LedgeDetectorHistory[frameNumber] = p.LedgeDetector.SnapShot();
      history.SensorsHistory[frameNumber] = p.Sensors.SnapShot();
      history.EcbHistory[frameNumber] = p.ECB.SnapShot();
      history.JumpHistroy[frameNumber] = p.Jump.SnapShot();
      history.AttackHistory[frameNumber] = p.Attacks.SnapShot();
    }
    w.SetPoolHistory();
  }

  // game/engine/finite-state-machine/PlayerStateMachine.ts
  var StateMachine = class {
    player;
    world;
    stateMappings;
    states;
    constructor(p, world) {
      this.player = p;
      this.world = world;
      this.player.FSMInfo.SetCurrentState(Idle);
      this.stateMappings = ActionMappings;
      this.states = FSMStates;
    }
    SetInitialState(stateId) {
      this.changeState(this.states.get(stateId), this.player.FSMInfo);
    }
    UpdateFromWorld(gameEventId) {
      const state = this.GetTranslation(gameEventId);
      if (state === void 0) {
        return;
      }
      const fsmInfo = this.player.FSMInfo;
      this.changeState(state, fsmInfo);
      fsmInfo.CurrentState.OnUpdate?.(this.player, this.world);
      fsmInfo.IncrementStateFrame();
    }
    ForceState(sateId) {
      const state = this.states.get(sateId);
      if (state === void 0) {
        return;
      }
      const fsmInfo = this.player.FSMInfo;
      this.changeState(state, fsmInfo);
      fsmInfo.CurrentState.OnUpdate?.(this.player, this.world);
      fsmInfo.IncrementStateFrame();
    }
    UpdateFromInput(inputAction, world) {
      const fsmInfo = this.player.FSMInfo;
      if (this.runConditional(world, fsmInfo)) {
        return;
      }
      if (this.runNext(inputAction, fsmInfo)) {
        return;
      }
      if (this.runDefault(world, fsmInfo)) {
        return;
      }
      this.updateState(fsmInfo);
    }
    runConditional(world, fsmInfo) {
      const conditions = this.stateMappings.get(fsmInfo.CurrentStatetId).GetConditions();
      if (conditions === void 0) {
        return false;
      }
      const conditionalsLength = conditions.length;
      for (let i = 0; i < conditionalsLength; i++) {
        const stateId = RunCondition(conditions[i], world, this.player.ID);
        if (stateId !== void 0) {
          const state = this.states.get(stateId);
          if (state === void 0) {
            console.error("StateId not found in state machine: ", stateId);
            return false;
          }
          this.changeState(state, fsmInfo);
          this.updateState(fsmInfo);
          return true;
        }
      }
      return false;
    }
    runNext(inputAction, fsmInfo) {
      const state = this.GetTranslation(inputAction.Action);
      if (state !== void 0) {
        this.changeState(state, fsmInfo);
        this.updateState(fsmInfo);
        return true;
      }
      return false;
    }
    runDefault(w, fsmInfo) {
      if (this.IsDefaultFrame(fsmInfo) === false) {
        return false;
      }
      const defaultTransition = this.GetDefaultState(
        this.player.FSMInfo.CurrentStatetId,
        w
      );
      if (defaultTransition === void 0) {
        return false;
      }
      this.changeState(defaultTransition, fsmInfo);
      this.updateState(fsmInfo);
      return true;
    }
    GetTranslation(gameEventId) {
      const stateMappings = this.stateMappings.get(
        this.player.FSMInfo.CurrentStatetId
      );
      const nextStateId = stateMappings?.GetMapping(gameEventId);
      if (nextStateId !== void 0) {
        const state = this.states.get(nextStateId);
        return state;
      }
      return void 0;
    }
    GetDefaultState(stateId, w) {
      const stateMapping = this.stateMappings.get(stateId);
      if (stateMapping === void 0) {
        return void 0;
      }
      const defaultStateConditions = stateMapping.GetDefaults();
      if (defaultStateConditions === void 0) {
        return void 0;
      }
      const defaultConditionsLength = defaultStateConditions.length;
      for (let i = 0; i < defaultConditionsLength; i++) {
        const condition = defaultStateConditions[i];
        const stateId2 = RunCondition(condition, w, this.player.ID);
        if (stateId2 !== void 0) {
          return this.states.get(stateId2);
        }
      }
      return void 0;
    }
    changeState(state, fsmInfo) {
      fsmInfo.SetStateFrameToZero();
      fsmInfo.CurrentState.OnExit(this.player, this.world);
      fsmInfo.SetCurrentState(state);
      fsmInfo.CurrentState.OnEnter(this.player, this.world);
    }
    updateState(fsmInfo) {
      fsmInfo.CurrentState.OnUpdate(this.player, this.world);
      fsmInfo.IncrementStateFrame();
    }
    IsDefaultFrame(fsmInfo) {
      const fl = fsmInfo.GetCurrentStateFrameLength();
      if (fl === void 0) {
        return false;
      }
      if (fl === fsmInfo.CurrentStateFrame) {
        return true;
      }
      return false;
    }
  };

  // game/engine/engine-state-management/Managers.ts
  var InputStoreLocal = class {
    P1localInputStore;
    constructor() {
      this.P1localInputStore = new Array(1e3);
    }
    StoreInputForFrame(frame, input) {
      this.P1localInputStore[frame] = input;
    }
    GetInputForFrame(frame) {
      frame = frame >= 0 ? frame : 0;
      return this.P1localInputStore[frame];
    }
  };

  // game/engine/pools/PooledVector.ts
  var PooledVector = class {
    x;
    y;
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    AddVec(vec) {
      this.x += vec.X;
      this.y += vec.Y;
      return this;
    }
    AddXY(x, y) {
      this.x += x;
      this.y += y;
      return this;
    }
    SubtractVec(vec) {
      this.x -= vec.X;
      this.y -= vec.Y;
      return this;
    }
    SubtractXY(x, y) {
      this.x -= x;
      this.y -= y;
      return this;
    }
    Multiply(s) {
      this.x *= s;
      this.y *= s;
      return this;
    }
    Negate() {
      this.x = -this.x;
      this.y = -this.y;
      return this;
    }
    Divide(s) {
      this.x /= s;
      this.y /= s;
      return this;
    }
    Length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    Distance(vec) {
      const dx = this.x - vec.X;
      const dy = this.y - vec.Y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    Normalize() {
      const length = Math.sqrt(this.x * this.x + this.y * this.y);
      this.x /= length;
      this.y /= length;
      return this;
    }
    DotProduct(vec) {
      return this.x * vec.X + this.y * vec.Y;
    }
    CrossProduct(vec) {
      return this.x * vec.Y - this.y * vec.X;
    }
    SetFromFlatVec(vec) {
      this.x = vec.X;
      this.y = vec.Y;
      return this;
    }
    AddToX(x) {
      this.x += x;
    }
    AddToY(y) {
      this.y += y;
    }
    get X() {
      return this.x;
    }
    get Y() {
      return this.y;
    }
    SetX(x) {
      this.x = x;
      return this;
    }
    SetY(y) {
      this.y = y;
      return this;
    }
    SetXY(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
    Zero() {
      this.x = 0;
      this.y = 0;
    }
  };

  // game/engine/pools/Pool.ts
  var Pool = class {
    poolIndex = 0;
    pool;
    constructorFunc;
    constructor(poolSize, constructorFunc) {
      this.pool = new Array(poolSize);
      this.constructorFunc = constructorFunc;
      for (let i = 0; i < poolSize; i++) {
        this.pool[i] = constructorFunc();
      }
    }
    Rent() {
      const pi = this.poolIndex;
      const p = this.pool;
      const pLength = p.length;
      if (pi < pLength) {
        let item = p[pi];
        item.Zero();
        this.poolIndex++;
        return item;
      }
      return this.constructorFunc();
    }
    Zero() {
      this.poolIndex = 0;
    }
    get ActiveCount() {
      return this.poolIndex;
    }
  };

  // game/engine/pools/CollisionResult.ts
  var CollisionResult = class {
    collision = false;
    normX = 0;
    normY = 0;
    depth = 0;
    SetCollisionTrue(x, y, depth) {
      this.collision = true;
      this.normX = x;
      this.normY = y;
      this.depth = depth;
    }
    SetCollisionFalse() {
      this.collision = false;
      this.normX = 0;
      this.normY = 0;
      this.depth = 0;
    }
    get Collision() {
      return this.collision;
    }
    get Depth() {
      return this.depth;
    }
    get NormX() {
      return this.normX;
    }
    get NormY() {
      return this.normY;
    }
    Zero() {
      this.SetCollisionFalse();
    }
  };

  // game/engine/pools/ProjectResult.ts
  var ProjectionResult = class {
    min;
    max;
    constructor(x = 0, y = 0) {
      this.min = x;
      this.max = y;
    }
    get Max() {
      return this.max;
    }
    get Min() {
      return this.min;
    }
    SetMinMax(min, max) {
      this.min = min;
      this.max = max;
    }
    Zero() {
      this.min = 0;
      this.max = 0;
    }
  };

  // game/engine/pools/AttackResult.ts
  var AttackResult = class {
    hit = false;
    damage = 0;
    baseKnockBack = 0;
    knockBackScaling = 1;
    launchAngle = 0;
    priority = Number.MAX_SAFE_INTEGER;
    normX = 0;
    normY = 0;
    depth = 0;
    playerIndexOfPlayerHit = -1;
    Zero() {
      this.hit = false;
      this.damage = 0;
      this.baseKnockBack = 0;
      this.knockBackScaling = 1;
      this.launchAngle = 0;
      this.priority = Number.MAX_SAFE_INTEGER;
      this.normX = 0;
      this.normY = 0;
      this.depth = 0;
      this.playerIndexOfPlayerHit = -1;
    }
    SetTrue(playerIndex, damage, priority, normX, normY, depth, baseKnockBack, knockBackScaling, launchAngle) {
      this.hit = true;
      this.playerIndexOfPlayerHit = playerIndex;
      this.damage = damage;
      this.priority = priority;
      this.normX = normX;
      this.normY = normY;
      this.depth = depth;
      this.baseKnockBack = baseKnockBack;
      this.knockBackScaling = knockBackScaling;
      this.launchAngle = launchAngle;
    }
    get Hit() {
      return this.hit;
    }
    get Damage() {
      return this.damage;
    }
    get Priority() {
      return this.priority;
    }
    get NormX() {
      return this.normX;
    }
    get NormY() {
      return this.normY;
    }
    get Depth() {
      return this.depth;
    }
    get BaseKnockBack() {
      return this.baseKnockBack;
    }
    get LaunchAngle() {
      return this.launchAngle;
    }
    get KnockBackScaling() {
      return this.knockBackScaling;
    }
    get PlayerIndex() {
      return this.playerIndexOfPlayerHit;
    }
  };

  // game/engine/pools/ClosestPointsResult.ts
  var ClosestPointsResult = class {
    c1X = 0;
    c1Y = 0;
    c2X = 0;
    c2Y = 0;
    Zero() {
      this.c1X = 0;
      this.c1Y = 0;
      this.c2X = 0;
      this.c2Y = 0;
    }
    Set(c1X, c1Y, c2X, c2Y) {
      this.c1X = c1X;
      this.c1Y = c1Y;
      this.c2X = c2X;
      this.c2Y = c2Y;
    }
    get C1X() {
      return this.c1X;
    }
    get C1Y() {
      return this.c1Y;
    }
    get C2X() {
      return this.c2X;
    }
    get C2Y() {
      return this.c2Y;
    }
  };

  // game/engine/pools/ActiveAttackHitBubbles.ts
  var ActiveHitBubblesDTO = class {
    bubbles = [];
    AddBubble(bub) {
      this.bubbles.push(bub);
      return this;
    }
    AtIndex(index) {
      return this.bubbles[index];
    }
    get Bubbles() {
      return this.bubbles;
    }
    get Length() {
      return this.bubbles.length;
    }
    Zero() {
      this.bubbles.length = 0;
    }
  };

  // game/engine/world/world.ts
  var PlayerState = class {
    players = [];
    stateMachines = [];
    inputStore = [];
    StateMachine(playerId) {
      return this.stateMachines[playerId];
    }
    InputStore(playerId) {
      return this.inputStore[playerId];
    }
    Player(playerId) {
      return this.players[playerId];
    }
    AddPlayer(p) {
      this.players.push(p);
    }
    AddStateMachine(sm) {
      this.stateMachines.push(sm);
    }
    AddInputStore(is) {
      this.inputStore.push(is);
    }
    get PlayerCount() {
      return this.players.length;
    }
  };
  var StageWorldState = class {
    Stage;
  };
  var PoolContainer = class {
    ActiveHitBubbleDtoPool;
    VecPool;
    ColResPool;
    ProjResPool;
    AtkResPool;
    ClstsPntsResPool;
    constructor() {
      this.ActiveHitBubbleDtoPool = new Pool(
        20,
        () => new ActiveHitBubblesDTO()
      );
      this.VecPool = new Pool(500, () => new PooledVector());
      this.ColResPool = new Pool(
        100,
        () => new CollisionResult()
      );
      this.ProjResPool = new Pool(
        200,
        () => new ProjectionResult()
      );
      this.AtkResPool = new Pool(100, () => new AttackResult());
      this.ClstsPntsResPool = new Pool(
        400,
        () => new ClosestPointsResult()
      );
    }
    Zero() {
      this.ActiveHitBubbleDtoPool.Zero();
      this.VecPool.Zero();
      this.ColResPool.Zero();
      this.ProjResPool.Zero();
      this.AtkResPool.Zero();
      this.ClstsPntsResPool.Zero();
    }
  };
  var History = class {
    PlayerComponentHistories = [];
    RentedVecHistory = [];
    RentedColResHsitory = [];
    RentedProjResHistory = [];
    RentedAtkResHistory = [];
    RentedAtiveHitBubHistory = [];
  };
  var World = class {
    StageData = new StageWorldState();
    PlayerData = new PlayerState();
    HistoryData = new History();
    localFrame = 0;
    FrameTimes = [];
    FrameTimeStamps = [];
    Pools = new PoolContainer();
    get PreviousFrame() {
      return this.localFrame - 1 >= 0 ? this.localFrame - 1 : 0;
    }
    SetPlayer(p) {
      this.PlayerData.AddPlayer(p);
      this.PlayerData.AddStateMachine(new StateMachine(p, this));
      this.PlayerData.AddInputStore(new InputStoreLocal());
      const compHist = new ComponentHistory();
      compHist.StaticPlayerHistory.LedgeDetectorWidth = p.LedgeDetector.Width;
      compHist.StaticPlayerHistory.ledgDetecorHeight = p.LedgeDetector.Height;
      p.HurtBubbles.HurtCapsules.forEach(
        (hc) => compHist.StaticPlayerHistory.HurtCapsules.push(hc)
      );
      this.HistoryData.PlayerComponentHistories.push(compHist);
    }
    SetStage(s) {
      this.StageData.Stage = s;
    }
    GetComponentHistory(index) {
      return this.HistoryData.PlayerComponentHistories[index];
    }
    GetFrameTimeForFrame(frame) {
      return this.FrameTimes[frame];
    }
    SetFrameTimeForFrame(frame, frameTime) {
      this.FrameTimes[frame] = frameTime;
    }
    SetFrameTimeStampForFrame(frame, timeStamp) {
      this.FrameTimeStamps[frame] = timeStamp;
    }
    GetFrameTimeStampForFrame(frame) {
      return this.FrameTimeStamps[frame];
    }
    GetRentedVecsForFrame(frame) {
      return this.HistoryData.RentedVecHistory[frame];
    }
    GetRentedColResForFrame(frame) {
      return this.HistoryData.RentedColResHsitory[frame];
    }
    GetRentedProjResForFrame(frame) {
      return this.HistoryData.RentedProjResHistory[frame];
    }
    GetRentedAtkResForFrame(frame) {
      return this.HistoryData.RentedAtkResHistory[frame];
    }
    GetRentedActiveHitBubblesForFrame(frame) {
      return this.HistoryData.RentedAtiveHitBubHistory[frame];
    }
    SetPoolHistory() {
      const frame = this.localFrame;
      const histDat = this.HistoryData;
      const pools = this.Pools;
      histDat.RentedVecHistory[frame] = pools.VecPool.ActiveCount;
      histDat.RentedColResHsitory[frame] = pools.ColResPool.ActiveCount;
      histDat.RentedProjResHistory[frame] = pools.ProjResPool.ActiveCount;
      histDat.RentedAtkResHistory[frame] = pools.AtkResPool.ActiveCount;
      histDat.RentedAtiveHitBubHistory[frame] = pools.ActiveHitBubbleDtoPool.ActiveCount;
    }
  };

  // game/engine/jazz.ts
  var Jazz = class {
    world;
    constructor() {
      this.world = new World();
    }
    get World() {
      return this.world;
    }
    Init(numberOfPlayers, positions) {
      for (let i = 0; i < numberOfPlayers; i++) {
        const pos = positions[i];
        const charConfig = new DefaultCharacterConfig();
        const p = new Player(i, charConfig);
        this.world.SetPlayer(p);
        p.SetPlayerInitialPosition(pos.X, pos.Y);
      }
      const s = defaultStage();
      this.world.SetStage(s);
    }
    Tick() {
      let frameTimeStart = performance.now();
      this.tick();
      let frameTimeDelta = performance.now() - frameTimeStart;
      const world = this.World;
      world.SetFrameTimeForFrame(world.localFrame, frameTimeDelta);
      world.SetFrameTimeStampForFrame(world.localFrame, frameTimeStart);
      world.Pools.Zero();
      world.localFrame++;
    }
    UpdateInputForCurrentFrame(ia, pIndex) {
      this.UpdateInput(pIndex, ia, this.world.localFrame);
    }
    UpdateInput(pIndex, inputAction, frameNumber) {
      this.world.PlayerData.InputStore(pIndex).StoreInputForFrame(
        frameNumber,
        inputAction
      );
    }
    tick() {
      const world = this.world;
      const frame = world.localFrame;
      const playerData = world.PlayerData;
      const playerCount = playerData.PlayerCount;
      const stageData = world.StageData;
      const historyData = world.HistoryData;
      const pools = world.Pools;
      for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
        const player = playerData.Player(playerIndex);
        player?.ECB.UpdatePreviousECB();
      }
      PlayerInput(playerData, world);
      Gravity(playerData, stageData);
      ApplyVelocty(playerData);
      ApplyVeloctyDecay(playerData, stageData);
      PlayerCollisionDetection(playerData, pools);
      PlatformDetection(playerData, stageData, frame);
      StageCollisionDetection(playerData, stageData, pools);
      LedgeGrabDetection(playerData, stageData, pools);
      PlayerSensors(world, playerData, pools);
      PlayerAttacks(playerData, historyData, pools, frame);
      OutOfBoundsCheck(playerData, stageData);
      TimedFlags(playerData);
      RecordHistory(world, playerData, historyData, frame);
    }
  };
  var JazzDebugger = class {
    jazz;
    paused = false;
    previousInput = void 0;
    advanceFrame = false;
    constructor() {
      this.jazz = new Jazz();
    }
    UpdateInputForCurrentFrame(ia, pIndex) {
      this.togglePause(ia);
      if (this.paused) {
        if (this.advanceOneFrame(ia)) {
          this.advanceFrame = true;
          this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
        }
        this.previousInput = ia;
        return;
      }
      this.jazz.UpdateInputForCurrentFrame(ia, pIndex);
      this.previousInput = ia;
    }
    Init(numberOfPlayers, positions) {
      this.jazz.Init(numberOfPlayers, positions);
    }
    Tick() {
      if (this.paused && this.advanceFrame) {
        this.advanceFrame = false;
        this.jazz.Tick();
        return;
      }
      if (!this.paused) {
        this.jazz.Tick();
      }
    }
    get World() {
      return this.jazz.World;
    }
    togglePause(ia) {
      const PausedPreviouisInput = this.previousInput?.Start ?? false;
      const PausedCurrentInput = ia.Start ?? false;
      if (PausedPreviouisInput === false && PausedCurrentInput) {
        this.paused = !this.paused;
      }
    }
    advanceOneFrame(ia) {
      const selectPressed = ia.Select ?? false;
      const selectHeld = this.previousInput?.Select ?? false;
      return selectPressed && !selectHeld;
    }
  };

  // game/render/debug-2d.ts
  function getAlpha(timeStampNow, lastFrame, localFrame, previousFrameTimeStamp, currentFrameTimeStamp) {
    const preClampAlpha = (timeStampNow - previousFrameTimeStamp) / (currentFrameTimeStamp - previousFrameTimeStamp);
    const postClampalpha = Math.max(0, Math.min(1, preClampAlpha));
    let alpha = preClampAlpha - postClampalpha;
    if (localFrame === lastFrame || alpha > 1) {
      alpha = 1;
    }
    return alpha;
  }
  var DebugRenderer = class {
    canvas;
    ctx;
    xRes;
    yRes;
    lastFrame = 0;
    constructor(canvas, res, numberOfPlayers = 1) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.xRes = res.x;
      this.yRes = res.y;
      this.canvas.width = this.xRes;
      this.canvas.height = this.yRes;
    }
    render(world, timeStampNow) {
      const localFrame = world.localFrame - 1 < 0 ? 0 : world.localFrame - 1;
      const previousFrameTimeStamp = world.GetFrameTimeStampForFrame(
        localFrame === 0 ? 0 : localFrame - 1
      );
      const currentFrameTimeStamp = world.GetFrameTimeStampForFrame(localFrame);
      const alpha = getAlpha(
        timeStampNow,
        this.lastFrame,
        localFrame,
        previousFrameTimeStamp,
        currentFrameTimeStamp
      );
      const playerStateHistory = world.GetComponentHistory(0);
      const playerFacingRight = playerStateHistory?.FlagsHistory[localFrame]?.FacingRight ?? true;
      const playerFsmState = playerStateHistory?.FsmInfoHistory[localFrame]?.State?.StateName ?? "N/A";
      const currentAttack = playerStateHistory?.AttackHistory[localFrame];
      const currentAttackString = currentAttack?.Name;
      if (localFrame === 0) {
        return;
      }
      const ctx = this.ctx;
      ctx.fillStyle = "grey";
      ctx.fillRect(0, 0, this.xRes, this.yRes);
      drawStage(ctx, world);
      drawPlatforms(ctx, world.StageData.Stage.Platforms);
      drawPlayer(ctx, world, alpha);
      const frameTime = world.GetFrameTimeForFrame(localFrame);
      ctx.fillStyle = "darkblue";
      ctx.fillText(`Frame: ${localFrame}`, 10, 30);
      ctx.fillText(`FrameTime: ${frameTime}`, 10, 60);
      ctx.fillText(`PlayerState: ${playerFsmState}`, 10, 90);
      ctx.fillText(`Facing Right: ${playerFacingRight}`, 10, 120);
      ctx.fillText(
        `VectorsRented: ${world.GetRentedVecsForFrame(localFrame)}`,
        10,
        150
      );
      ctx.fillText(
        `CollisionResultsRented: ${world.GetRentedColResForFrame(localFrame)}`,
        10,
        180
      );
      ctx.fillText(
        `ProjectionReultsRented: ${world.GetRentedProjResForFrame(localFrame)}`,
        10,
        210
      );
      if (currentAttackString !== void 0) {
        ctx.fillText(`Attack Name: ${currentAttackString}`, 10, 240);
      }
      this.lastFrame = localFrame;
    }
  };
  function drawStage(ctx, world) {
    const stage = world.StageData.Stage;
    const stageVerts = stage.StageVerticies.GetVerts();
    const color = "green";
    const stageVertsLength = stageVerts.length;
    ctx.beginPath();
    ctx.moveTo(stageVerts[0].X, stageVerts[0].Y);
    for (let i = 0; i < stageVertsLength; i++) {
      ctx.lineTo(stageVerts[i].X, stageVerts[i].Y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    const lLedge = stage.Ledges.GetLeftLedge();
    const rLedge = stage.Ledges.GetRightLedge();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(lLedge[0].X, lLedge[0].Y);
    for (let i = 0; i < lLedge.length; i++) {
      ctx.lineTo(lLedge[i].X, lLedge[i].Y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rLedge[0].X, rLedge[0].Y);
    for (let i = 0; i < rLedge.length; i++) {
      ctx.lineTo(rLedge[i].X, rLedge[i].Y);
    }
    ctx.closePath();
    ctx.fill();
  }
  function drawPlatforms(ctx, plats) {
    if (plats === void 0 || plats.length === 0) {
      return;
    }
    const color = "white";
    const platsLength = plats.length;
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    for (let i = 0; i < platsLength; i++) {
      const plat = plats[i];
      ctx.beginPath();
      ctx.moveTo(plat.X1, plat.Y1);
      ctx.lineTo(plat.X2, plat.Y2);
      ctx.closePath();
      ctx.stroke();
    }
  }
  function drawPlayer(ctx, world, alpha) {
    const playerCount = world.PlayerData.PlayerCount;
    const currentFrame = world.localFrame - 1;
    const lastFrame = currentFrame < 1 ? 0 : currentFrame - 1;
    for (let i = 0; i < playerCount; i++) {
      const playerHistory = world.GetComponentHistory(i);
      const pos = playerHistory.PositionHistory[currentFrame];
      const lastPos = playerHistory.PositionHistory[lastFrame];
      const circlesHistory = playerHistory.StaticPlayerHistory.HurtCapsules;
      const flags = playerHistory.FlagsHistory[currentFrame];
      const lastFlags = playerHistory.FlagsHistory[lastFrame];
      const ecb = playerHistory.EcbHistory[currentFrame];
      const lastEcb = playerHistory.EcbHistory[lastFrame];
      const lD = playerHistory.LedgeDetectorHistory[currentFrame];
      const lastLd = playerHistory.LedgeDetectorHistory[lastFrame];
      const facingRight = flags.FacingRight;
      const lastFacingRight = lastFlags?.FacingRight;
      const attack = playerHistory.AttackHistory[currentFrame];
      const fsm = playerHistory.FsmInfoHistory[currentFrame];
      drawPrevEcb(ctx, ecb, lastEcb, alpha);
      drawCurrentECB(ctx, ecb, lastEcb, alpha);
      drawHurtCircles(ctx, pos, lastPos, circlesHistory, alpha);
      drawPositionMarker(ctx, pos, lastPos, alpha);
      const lerpDirection = alpha > 0.5 ? facingRight : lastFacingRight;
      drawDirectionMarker(ctx, lerpDirection, ecb, lastEcb, alpha);
      drawLedgeDetectors(
        ctx,
        facingRight,
        playerHistory.StaticPlayerHistory,
        lD,
        lastLd,
        alpha
      );
    }
    for (let i = 0; i < playerCount; i++) {
      const playerHistory = world.GetComponentHistory(i);
      const sensorsWrapper = playerHistory.SensorsHistory[currentFrame];
      const sensors = sensorsWrapper.sensors;
      if (sensors.length === 0) {
        continue;
      }
      const pos = playerHistory.PositionHistory[currentFrame];
      const lastPos = playerHistory.PositionHistory[lastFrame];
      const flags = playerHistory.FlagsHistory[currentFrame];
      drawSensors(ctx, alpha, pos, lastPos, flags, sensorsWrapper);
    }
    for (let i = 0; i < playerCount; i++) {
      const playerHistory = world.GetComponentHistory(i);
      const pos = playerHistory.PositionHistory[currentFrame];
      const lastPos = playerHistory.PositionHistory[lastFrame];
      const flags = playerHistory.FlagsHistory[currentFrame];
      const attack = playerHistory.AttackHistory[currentFrame];
      const fsm = playerHistory.FsmInfoHistory[currentFrame];
      drawHitCircles(ctx, attack, fsm, flags, pos, lastPos, alpha);
    }
  }
  function drawSensors(ctx, alpha, curPos, lastPos, flags, sensorsWrapper) {
    ctx.strokeStyle = "white";
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.4;
    const sensors = sensorsWrapper.sensors;
    const interpolatedX = Lerp(lastPos.X, curPos.X, alpha);
    const interpolatedY = Lerp(lastPos.Y, curPos.Y, alpha);
    const facingRight = flags.FacingRight;
    const sensorLength = sensors.length;
    for (let i = 0; i < sensorLength; i++) {
      const s = sensors[i];
      const x = interpolatedX + (facingRight ? s.xOffset : -s.xOffset);
      const y = interpolatedY + s.yOffset;
      ctx.beginPath();
      ctx.arc(x, y, s.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
    ctx.globalAlpha = 1;
  }
  function drawLedgeDetectors(ctx, facingRight, staticHistory, ledgeDetectorHistory, lastLedgeDetectorHistory, alpha) {
    const ldHeight = staticHistory.ledgDetecorHeight;
    const ldWidth = staticHistory.LedgeDetectorWidth;
    const curMiddleTopX = ledgeDetectorHistory.middleX;
    const curMiddleTopY = ledgeDetectorHistory.middleY;
    const curTopRightX = ledgeDetectorHistory.middleX + ldWidth;
    const curTopRightY = ledgeDetectorHistory.middleY;
    const curBottomRightX = ledgeDetectorHistory.middleX + ldWidth;
    const curBottomRightY = ledgeDetectorHistory.middleY + ldHeight;
    const curMiddleBottomx = ledgeDetectorHistory.middleX;
    const curMiddleBottomY = ledgeDetectorHistory.middleY + ldHeight;
    const curTopLeftX = ledgeDetectorHistory.middleX - ldWidth;
    const curTopLeftY = ledgeDetectorHistory.middleY;
    const curBottomLeftX = ledgeDetectorHistory.middleX - ldWidth;
    const curBottomLeftY = ledgeDetectorHistory.middleY + ldHeight;
    const lastMiddleTopX = lastLedgeDetectorHistory.middleX;
    const lastMiddleTopY = lastLedgeDetectorHistory.middleY;
    const lastTopRightX = lastLedgeDetectorHistory.middleX + ldWidth;
    const lastTopRightY = lastLedgeDetectorHistory.middleY;
    const lastBottomRightX = lastLedgeDetectorHistory.middleX + ldWidth;
    const lastBottomRightY = lastLedgeDetectorHistory.middleY + ldHeight;
    const lastMiddleBottomx = lastLedgeDetectorHistory.middleX;
    const lastMiddleBottomY = lastLedgeDetectorHistory.middleY + ldHeight;
    const lastTopLeftX = lastLedgeDetectorHistory.middleX - ldWidth;
    const lastTopLeftY = lastLedgeDetectorHistory.middleY;
    const lastBottomLeftX = lastLedgeDetectorHistory.middleX - ldWidth;
    const lastBottomLeftY = lastLedgeDetectorHistory.middleY + ldHeight;
    const middleTopX = Lerp(lastMiddleTopX, curMiddleTopX, alpha);
    const middleTopY = Lerp(lastMiddleTopY, curMiddleTopY, alpha);
    const TopRightX = Lerp(lastTopRightX, curTopRightX, alpha);
    const TopRightY = Lerp(lastTopRightY, curTopRightY, alpha);
    const BottomRightX = Lerp(lastBottomRightX, curBottomRightX, alpha);
    const BottomRightY = Lerp(lastBottomRightY, curBottomRightY, alpha);
    const middleBottomx = Lerp(lastMiddleBottomx, curMiddleBottomx, alpha);
    const middleBottomY = Lerp(lastMiddleBottomY, curMiddleBottomY, alpha);
    const topLeftX = Lerp(lastTopLeftX, curTopLeftX, alpha);
    const topLeftY = Lerp(lastTopLeftY, curTopLeftY, alpha);
    const bottomLeftX = Lerp(lastBottomLeftX, curBottomLeftX, alpha);
    const bottomLeftY = Lerp(lastBottomLeftY, curBottomLeftY, alpha);
    ctx.strokeStyle = "blue";
    if (!facingRight) {
      ctx.strokeStyle = "red";
    }
    ctx.beginPath();
    ctx.moveTo(middleTopX, middleTopY);
    ctx.lineTo(TopRightX, TopRightY);
    ctx.lineTo(BottomRightX, BottomRightY);
    ctx.lineTo(middleBottomx, middleBottomY);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "red";
    if (!facingRight) {
      ctx.strokeStyle = "blue";
    }
    ctx.beginPath();
    ctx.moveTo(topLeftX, topLeftY);
    ctx.lineTo(middleTopX, middleTopY);
    ctx.lineTo(middleBottomx, middleBottomY);
    ctx.lineTo(bottomLeftX, bottomLeftY);
    ctx.closePath();
    ctx.stroke();
  }
  function drawDirectionMarker(ctx, facingRight, ecb, lastEcb, alpha) {
    const yOffset = ecb.YOffset;
    ctx.strokeStyle = "white";
    if (facingRight) {
      const curRightX = ComponentHistory.GetRightXFromEcbHistory(ecb);
      const curRightY = ComponentHistory.GetRightYFromEcbHistory(ecb) + yOffset;
      const lastRightX = ComponentHistory.GetRightXFromEcbHistory(lastEcb);
      const lastRightY = ComponentHistory.GetRightYFromEcbHistory(lastEcb) + yOffset;
      const rightX = Lerp(lastRightX, curRightX, alpha);
      const rightY = Lerp(lastRightY, curRightY, alpha);
      ctx.beginPath();
      ctx.moveTo(rightX, rightY);
      ctx.lineTo(rightX + 10, rightY);
      ctx.stroke();
      ctx.closePath();
    } else {
      const curLeftX = ComponentHistory.GetLeftXFromEcbHistory(ecb);
      const curLeftY = ComponentHistory.GetLeftYFromEcbHistory(ecb) + yOffset;
      const lastLeftX = ComponentHistory.GetLeftXFromEcbHistory(lastEcb);
      const lastLeftY = ComponentHistory.GetLeftYFromEcbHistory(lastEcb) + yOffset;
      const leftX = Lerp(lastLeftX, curLeftX, alpha);
      const leftY = Lerp(lastLeftY, curLeftY, alpha);
      ctx.beginPath();
      ctx.moveTo(leftX, leftY);
      ctx.lineTo(leftX - 10, leftY);
      ctx.stroke();
      ctx.closePath();
    }
  }
  function drawPrevEcb(ctx, curEcb, lastEcb, alpha) {
    ctx.fillStyle = "red";
    ctx.lineWidth = 3;
    const curYOffset = curEcb.YOffset;
    const prevYOffset = lastEcb.YOffset;
    const curLeftX = ComponentHistory.GetPrevLeftXFromEcbHistory(curEcb);
    const curLeftY = ComponentHistory.GetPrevLeftYFromEcbHistory(curEcb) + curYOffset;
    const curTopX = ComponentHistory.GetPrevTopXFromEcbHistory(curEcb);
    const curTopY = ComponentHistory.GetPrevTopYFromEcbHistory(curEcb) + curYOffset;
    const curRightX = ComponentHistory.GetPrevRightXFromEcbHistory(curEcb);
    const curRightY = ComponentHistory.GetPrevRightYFromEcbHistory(curEcb) + curYOffset;
    const curBottomX = ComponentHistory.GetPrevBottomXFromEcbHistory(curEcb);
    const curBottomY = ComponentHistory.GetPrevBottomYFromEcbHistory(curEcb) + curYOffset;
    const lastLeftX = ComponentHistory.GetPrevLeftXFromEcbHistory(lastEcb);
    const lastLeftY = ComponentHistory.GetPrevLeftYFromEcbHistory(lastEcb) + prevYOffset;
    const lastTopX = ComponentHistory.GetPrevTopXFromEcbHistory(lastEcb);
    const lastTopY = ComponentHistory.GetPrevTopYFromEcbHistory(lastEcb) + prevYOffset;
    const lastRightX = ComponentHistory.GetPrevRightXFromEcbHistory(lastEcb);
    const lastRightY = ComponentHistory.GetPrevRightYFromEcbHistory(lastEcb) + prevYOffset;
    const LastBottomX = ComponentHistory.GetPrevBottomXFromEcbHistory(lastEcb);
    const LastBottomY = ComponentHistory.GetPrevBottomYFromEcbHistory(lastEcb) + prevYOffset;
    const leftX = Lerp(lastLeftX, curLeftX, alpha);
    const leftY = Lerp(lastLeftY, curLeftY, alpha);
    const topX = Lerp(lastTopX, curTopX, alpha);
    const topY = Lerp(lastTopY, curTopY, alpha);
    const rightX = Lerp(lastRightX, curRightX, alpha);
    const rightY = Lerp(lastRightY, curRightY, alpha);
    const bottomX = Lerp(LastBottomX, curBottomX, alpha);
    const bottomY = Lerp(LastBottomY, curBottomY, alpha);
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(bottomX, bottomY);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
  function drawCurrentECB(ctx, ecb, lastEcb, alpha) {
    const curyOffset = ecb.YOffset;
    const prevYOffset = lastEcb.YOffset;
    const curLeftX = ComponentHistory.GetLeftXFromEcbHistory(ecb);
    const curLeftY = ComponentHistory.GetLeftYFromEcbHistory(ecb) + curyOffset;
    const curTopX = ComponentHistory.GetTopXFromEcbHistory(ecb);
    const curTopY = ComponentHistory.GetTopYFromEcbHistory(ecb) + curyOffset;
    const curRightX = ComponentHistory.GetRightXFromEcbHistory(ecb);
    const curRightY = ComponentHistory.GetRightYFromEcbHistory(ecb) + curyOffset;
    const curBottomX = ComponentHistory.GetBottomXFromEcbHistory(ecb);
    const curBottomY = ComponentHistory.GetBottomYFromEcbHistory(ecb) + curyOffset;
    const lastLeftX = ComponentHistory.GetLeftXFromEcbHistory(lastEcb);
    const lastLeftY = ComponentHistory.GetLeftYFromEcbHistory(lastEcb) + prevYOffset;
    const lastTopX = ComponentHistory.GetTopXFromEcbHistory(lastEcb);
    const lastTopY = ComponentHistory.GetTopYFromEcbHistory(lastEcb) + prevYOffset;
    const lastRightX = ComponentHistory.GetRightXFromEcbHistory(lastEcb);
    const lastRightY = ComponentHistory.GetRightYFromEcbHistory(lastEcb) + prevYOffset;
    const lastBottomX = ComponentHistory.GetBottomXFromEcbHistory(lastEcb);
    const lastBottomY = ComponentHistory.GetBottomYFromEcbHistory(lastEcb) + prevYOffset;
    const leftX = Lerp(lastLeftX, curLeftX, alpha);
    const leftY = Lerp(lastLeftY, curLeftY, alpha);
    const topX = Lerp(lastTopX, curTopX, alpha);
    const topY = Lerp(lastTopY, curTopY, alpha);
    const rightX = Lerp(lastRightX, curRightX, alpha);
    const rightY = Lerp(lastRightY, curRightY, alpha);
    const bottomX = Lerp(lastBottomX, curBottomX, alpha);
    const bottomY = Lerp(lastBottomY, curBottomY, alpha);
    ctx.fillStyle = "orange";
    ctx.strokeStyle = "purple";
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(bottomX, bottomY);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }
  var adto = new ActiveHitBubblesDTO();
  function drawHitCircles(ctx, attack, fsmInfo, flags, currentPosition, lastPosition, alpha) {
    if (attack === void 0) {
      return;
    }
    adto.Zero();
    const currentSateFrame = fsmInfo.StateFrame;
    const circles = attack.GetActiveHitBubblesForFrame(currentSateFrame, adto);
    if (circles === void 0) {
      return;
    }
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4;
    const length = circles.Length;
    const interpolatedX = Lerp(lastPosition.X, currentPosition.X, alpha);
    const interpolatedY = Lerp(lastPosition.Y, currentPosition.Y, alpha);
    for (let i = 0; i < length; i++) {
      const circle = circles.AtIndex(i);
      if (circle === void 0) {
        continue;
      }
      const offSet = circle?.GetLocalPosiitionOffsetForFrame(currentSateFrame);
      if (offSet === void 0) {
        continue;
      }
      const offsetX = flags.FacingRight ? interpolatedX + offSet.X : interpolatedX - offSet.X;
      const offsetY = interpolatedY + offSet.Y;
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, circle.Radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
    ctx.globalAlpha = 1;
  }
  function drawHurtCircles(ctx, curPositon, lasPosition, hurtCapsules, alpha) {
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "yellow";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    const lerpedPosX = Lerp(lasPosition.X, curPositon.X, alpha);
    const lerpedPosY = Lerp(lasPosition.Y, curPositon.Y, alpha);
    const hcLength = hurtCapsules.length;
    for (let i = 0; i < hcLength; i++) {
      const hurtCapsule = hurtCapsules[i];
      const globalStartX = hurtCapsule.StartOffsetX + lerpedPosX;
      const globalStartY = hurtCapsule.StartOffsetY + lerpedPosY;
      const globalEndX = hurtCapsule.EndOffsetX + lerpedPosX;
      const globalEndY = hurtCapsule.EndOffsetY + lerpedPosY;
      drawCapsule(
        ctx,
        globalStartX,
        globalStartY,
        globalEndX,
        globalEndY,
        hurtCapsule.Radius
      );
    }
    ctx.globalAlpha = 1;
  }
  function drawPositionMarker(ctx, posHistory, lastPosHistory, alpha) {
    const playerPosX = Lerp(lastPosHistory.X, posHistory.X, alpha);
    const playerPosY = Lerp(lastPosHistory.Y, posHistory.Y, alpha);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(playerPosX, playerPosY);
    ctx.lineTo(playerPosX + 10, playerPosY);
    ctx.stroke();
    ctx.moveTo(playerPosX, playerPosY);
    ctx.lineTo(playerPosX - 10, playerPosY);
    ctx.stroke();
    ctx.moveTo(playerPosX, playerPosY);
    ctx.lineTo(playerPosX, playerPosY + 10);
    ctx.stroke();
    ctx.moveTo(playerPosX, playerPosY);
    ctx.lineTo(playerPosX, playerPosY - 10);
    ctx.stroke();
    ctx.closePath();
  }
  function drawCapsule(ctx, x1, y1, x2, y2, radius) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const offsetX = Math.sin(angle) * radius;
    const offsetY = -Math.cos(angle) * radius;
    ctx.beginPath();
    ctx.arc(x1, y1, radius, angle + Math.PI / 2, angle - Math.PI / 2, false);
    ctx.lineTo(x2 + offsetX, y2 + offsetY);
    ctx.arc(x2, y2, radius, angle - Math.PI / 2, angle + Math.PI / 2, false);
    ctx.lineTo(x1 - offsetX, y1 - offsetY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // game/loops/FPS60LoopExecutor.ts
  function RENDERFPS60Loop(renderFunc) {
    function loop(now) {
      renderFunc(now);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // game/input/Input.ts
  var GamePadInput = class {
    LXAxis = 0;
    LYAxis = 0;
    RXAxis = 0;
    RYAxis = 0;
    action = false;
    special = false;
    jump = false;
    lb = false;
    rb = false;
    lt = false;
    rt = false;
    dpUp = false;
    dpDown = false;
    dpRight = false;
    dpLeft = false;
    start = false;
    select = false;
    Clear() {
      this.LXAxis = 0;
      this.LYAxis = 0;
      this.RXAxis = 0;
      this.RYAxis = 0;
      this.action = false;
      this.special = false;
      this.jump = false;
      this.lb = false;
      this.rb = false;
      this.lt = false;
      this.rt = false;
      this.dpUp = false;
      this.dpDown = false;
      this.dpLeft = false;
      this.dpRight = false;
      this.start = false;
      this.select = false;
    }
  };
  var currentInput = new GamePadInput();
  function readInput(gamePad) {
    currentInput.Clear();
    let lx = setDeadzone(gamePad.axes[0]);
    let ly = setDeadzone(gamePad.axes[1]);
    let rx = setDeadzone(gamePad.axes[2]);
    let ry = setDeadzone(gamePad.axes[3]);
    [lx, ly] = clampStick(lx, ly);
    [rx, ry] = clampStick(rx, ry);
    if (ly != 0) {
      ly *= -1;
    }
    if (ry != 0) {
      ry *= -1;
    }
    currentInput.LXAxis = lx;
    currentInput.LYAxis = ly;
    currentInput.RXAxis = rx;
    currentInput.RYAxis = ry;
    currentInput.action = gamePad.buttons[0].pressed;
    currentInput.special = gamePad.buttons[2].pressed;
    currentInput.jump = gamePad.buttons[1].pressed || gamePad.buttons[3].pressed;
    currentInput.lb = gamePad.buttons[4].pressed;
    currentInput.rb = gamePad.buttons[5].pressed;
    currentInput.lt = gamePad.buttons[6].pressed;
    currentInput.rt = gamePad.buttons[7].pressed;
    currentInput.dpUp = gamePad.buttons[12].pressed;
    currentInput.dpDown = gamePad.buttons[13].pressed;
    currentInput.dpLeft = gamePad.buttons[14].pressed;
    currentInput.dpRight = gamePad.buttons[15].pressed;
    currentInput.start = gamePad.buttons[9].pressed;
    currentInput.select = gamePad.buttons[8].pressed;
  }
  function GetInput(index, w) {
    const gp = navigator.getGamepads()[index];
    if (gp && gp.connected) {
      readInput(gp);
    }
    return transcribeInput(currentInput);
  }
  function handleSpecial(inputAction, LXAxis, LYAxis) {
    if (Math.abs(LYAxis) > Math.abs(LXAxis)) {
      if (LYAxis > 0) {
        inputAction.Action = GAME_EVENT_IDS.UP_SPCL_GE;
        return inputAction;
      }
      inputAction.Action = GAME_EVENT_IDS.DOWN_SPCL_GE;
      return inputAction;
    }
    if (LXAxis != 0) {
      inputAction.Action = GAME_EVENT_IDS.SIDE_SPCL_GE;
      return inputAction;
    }
    inputAction.Action = GAME_EVENT_IDS.SPCL_GE;
    return inputAction;
  }
  function handleAction(inputAction, LXAxis, LYAxis) {
    if (Math.abs(LYAxis) > Math.abs(LXAxis)) {
      if (LYAxis > 0) {
        inputAction.Action = GAME_EVENT_IDS.UP_ATTACK_GE;
        return inputAction;
      }
      inputAction.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
      return inputAction;
    }
    if (LXAxis != 0) {
      inputAction.Action = GAME_EVENT_IDS.SIDE_ATTACK_GE;
      return inputAction;
    }
    inputAction.Action = GAME_EVENT_IDS.ATTACK_GE;
    return inputAction;
  }
  function transcribeInput(input) {
    const LXAxis = input.LXAxis;
    const LYAxis = input.LYAxis;
    const RXAxis = input.RXAxis;
    const RYAxis = input.RYAxis;
    const inputAction = NewInputAction();
    inputAction.LXAxis = LXAxis;
    inputAction.LYAxis = LYAxis;
    inputAction.RXAxis = RXAxis;
    inputAction.RYAxis = RYAxis;
    inputAction.Start = input.start;
    inputAction.Select = input.select;
    if (input.special) {
      return handleSpecial(inputAction, LXAxis, LYAxis);
    }
    if (input.action) {
      return handleAction(inputAction, LXAxis, LYAxis);
    }
    if (Math.abs(RXAxis) > Math.abs(RYAxis)) {
      inputAction.Action = GAME_EVENT_IDS.SIDE_ATTACK_GE;
      return inputAction;
    }
    if (Math.abs(RYAxis) > Math.abs(RXAxis)) {
      if (RYAxis > 0) {
        inputAction.Action = GAME_EVENT_IDS.UP_ATTACK_GE;
        return inputAction;
      }
      inputAction.Action = GAME_EVENT_IDS.DOWN_ATTACK_GE;
      return inputAction;
    }
    if (input.rb) {
      inputAction.Action = GAME_EVENT_IDS.GRAB_GE;
      return inputAction;
    }
    if (input.rt || input.lt) {
      inputAction.Action = GAME_EVENT_IDS.GUARD_GE;
      return inputAction;
    }
    if (input.jump) {
      inputAction.Action = GAME_EVENT_IDS.JUMP_GE;
      return inputAction;
    }
    if (LYAxis > 0.7) {
      inputAction.Action = GAME_EVENT_IDS.UP_GE;
      return inputAction;
    }
    if (LYAxis < -0.5) {
      inputAction.Action = GAME_EVENT_IDS.DOWN_GE;
      return inputAction;
    }
    if (Math.abs(LXAxis) > 0) {
      inputAction.Action = Math.abs(LXAxis) > 0.6 ? GAME_EVENT_IDS.MOVE_FAST_GE : GAME_EVENT_IDS.MOVE_GE;
      return inputAction;
    }
    inputAction.Action = GAME_EVENT_IDS.IDLE_GE;
    return inputAction;
  }
  function setDeadzone(v) {
    const DEADZONE = 0.2;
    if (Math.abs(v) < DEADZONE) {
      v = 0;
    } else {
      v = v - Math.sign(v) * DEADZONE;
      v /= 1 - DEADZONE;
    }
    return v;
  }
  var clampDto = [];
  function clampStick(x, y) {
    let m = Math.sqrt(x * x + y * y);
    if (m > 1) {
      x /= m;
      y /= m;
    }
    clampDto[0] = x;
    clampDto[1] = y;
    return clampDto;
  }
  function NewInputAction() {
    return {
      Action: GAME_EVENT_IDS.IDLE_GE,
      LXAxis: 0,
      LYAxis: 0,
      RXAxis: 0,
      RYAxis: 0
    };
  }

  // game/loops/local-main.ts
  var frameInterval = 1e3 / 60;
  function start(playerInfo) {
    const engine = new JazzDebugger();
    const playerCount = playerInfo.length;
    const positions = [{ X: 610, Y: 100 }];
    if (playerCount == 2) {
      positions.push({ X: 690, Y: 100 });
    }
    engine.Init(playerCount, positions);
    for (let i = 0; i < playerCount; i++) {
      const sm = engine.World.PlayerData.StateMachine(i);
      sm.SetInitialState(STATE_IDS.N_FALL_S);
    }
    LOGIC_LOOP(engine, playerInfo);
    RENDER_LOOP(engine.World);
  }
  function LOGIC_LOOP(engine, gpInfo) {
    const logicLoopHandle = setInterval(() => {
      logicStep(engine, gpInfo);
    }, frameInterval);
  }
  function RENDER_LOOP(world) {
    const canvas = document.getElementById("game");
    const resolution2 = { x: 1920, y: 1080 };
    const dbRenderer = new DebugRenderer(canvas, resolution2);
    RENDERFPS60Loop((timeStamp) => {
      dbRenderer.render(world, timeStamp);
    });
  }
  function logicStep(engine, gamePadInfo) {
    const gamePadCount = gamePadInfo.length;
    const w = engine.World;
    for (let i = 0; i < gamePadCount; i++) {
      const info = gamePadInfo[i];
      const gpI = info.inputIndex;
      const pi = info.playerIndex;
      const input = GetInput(gpI, w);
      engine.UpdateInputForCurrentFrame(input, pi);
    }
    engine.Tick();
  }

  // game/ui/game-page.ts
  function GetConnectedGamePads() {
    const gamePads = navigator.getGamepads();
    let anyGps = false;
    gamePads.forEach((gp) => {
      if (gp) {
        anyGps = true;
      }
    });
    if (!anyGps) {
      console.log("no controller detected");
      return false;
    }
    const gpOptions = /* @__PURE__ */ new Map();
    let i = 0;
    for (const gp of gamePads) {
      i++;
      if (gp) {
        gpOptions.set(`${gp.id} -${i}`, gp.index);
      }
    }
    return gpOptions;
  }
  function populateControllerList(selectId) {
    const elem = document.getElementById(selectId);
    if (!elem || !(elem instanceof HTMLSelectElement)) {
      console.error(
        `Element with ID '${selectId}' is not a valid <select> element.`
      );
      return;
    }
    elem.innerHTML = "";
    const gamePads = GetConnectedGamePads();
    if (gamePads === false) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No controllers connected";
      option.selected = true;
      elem.appendChild(option);
      return;
    } else {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No controllers connected";
      option.selected = true;
      elem.appendChild(option);
    }
    gamePads.forEach((index, id) => {
      const option = document.createElement("option");
      option.value = index.toString();
      option.textContent = id;
      elem.appendChild(option);
    });
  }
  function InitGamePage() {
    console.log("InitGamePage called");
    setUpListeners();
    refreshGamePadList();
  }
  var gameMode = -1;
  function setUpListeners() {
    console.log("setUpListeners called");
    const modeSelect2 = document.getElementById(
      "mode-select"
    );
    if (modeSelect2) {
      console.log("mode-select found");
      modeSelect2.addEventListener("change", (event) => {
        console.log("mode-select change event fired");
        const selectedValue = event.target.value;
        const p1Select2 = document.getElementById(
          "p1-gamepad-select"
        );
        const p2Select2 = document.getElementById(
          "p2-gamepad-select"
        );
        const refreshButton = document.getElementById(
          "refresh-gamepad-select"
        );
        if (p1Select2) {
          p1Select2.disabled = true;
        }
        if (p2Select2) {
          p2Select2.disabled = true;
        }
        if (refreshButton) {
          refreshButton.disabled = true;
        }
        if (selectedValue == "1" || selectedValue == "2") {
          if (p1Select2) {
            p1Select2.disabled = false;
          }
        }
        if (selectedValue == "2") {
          if (p2Select2) {
            p2Select2.disabled = false;
          }
        }
        if (parseInt(selectedValue) > 0) {
          if (refreshButton) {
            refreshButton.disabled = false;
          }
        }
        gameMode = parseInt(selectedValue);
        updateCanStart();
      });
    } else {
      console.error("mode-select not found!");
    }
    const refreshBtn = document.getElementById(
      "refresh-gamepad-select"
    );
    if (refreshBtn) {
      console.log("refresh-gamepad-select found");
      refreshBtn.addEventListener("click", refreshGamePadList);
    } else {
      console.error("refresh-gamepad-select not found!");
    }
    window.addEventListener("gamepadconnected", (event) => {
      console.log("Gamepad connected:", event.gamepad);
      refreshGamePadList();
    });
    const p1Select = document.getElementById(
      "p1-gamepad-select"
    );
    if (p1Select) {
      console.log("p1-gamepad-select found");
      p1Select.addEventListener("change", (event) => {
        updateCanStart();
      });
    } else {
      console.error("p1-gamepad-select not found!");
    }
    const p2Select = document.getElementById(
      "p2-gamepad-select"
    );
    if (p2Select) {
      console.log("p2-gamepad-select found");
      p2Select.addEventListener("change", (event) => {
        updateCanStart();
      });
    } else {
      console.error("p2-gamepad-select not found!");
    }
  }
  function canStart() {
    const p1Select = document.getElementById(
      "p1-gamepad-select"
    );
    const p2Select = document.getElementById(
      "p2-gamepad-select"
    );
    if (!p1Select) {
      return false;
    }
    if (gameMode === 1) {
      return p1Select.value !== "";
    }
    if (gameMode === 2) {
      if (!p2Select) {
        return false;
      }
      return p1Select.value !== "" && p2Select.value !== "";
    }
    return false;
  }
  function updateCanStart() {
    const btn = document.getElementById("start-game");
    if (btn) {
      btn.disabled = !canStart();
    }
  }
  function refreshGamePadList() {
    populateControllerList("p1-gamepad-select");
    populateControllerList("p2-gamepad-select");
    updateCanStart();
  }

  // game/index.ts
  document.addEventListener("DOMContentLoaded", () => {
    InitGamePage();
  });
  var p1GamePadSelect = document.getElementById(
    "p1-gamepad-select"
  );
  var p2GamePadSelect = document.getElementById(
    "p2-gamepad-select"
  );
  var modeSelect = document.getElementById("mode-select");
  var starBtn = document.getElementById("start-game");
  starBtn.addEventListener("click", () => {
    const mode = modeSelect.value;
    const p1GamePad = Number.parseInt(p1GamePadSelect.value);
    if (mode == "1") {
      const controllerInfo = {
        playerIndex: 0,
        inputIndex: p1GamePad
      };
      start([controllerInfo]);
    }
    if (mode == "2") {
      const p2GamePad = Number.parseInt(p2GamePadSelect.value);
      const controllerInfo = [
        { playerIndex: 0, inputIndex: p1GamePad },
        { playerIndex: 1, inputIndex: p2GamePad }
      ];
      start(controllerInfo);
    }
  });
})();

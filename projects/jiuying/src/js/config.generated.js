/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "evidenceTypes": [
    {
      "id": "fact",
      "label": "事实",
      "slotId": "fact-slot",
      "assignButtonId": "assign-fact",
      "placeholder": "选择一条可直接核验的信息"
    },
    {
      "id": "inference",
      "label": "推断",
      "slotId": "inference-slot",
      "assignButtonId": "assign-inference",
      "placeholder": "选择一条需要关系推断的信息"
    }
  ],
  "evidence": [
    {
      "id": "receipt",
      "title": "送洗单据",
      "detail": "记录日期为 6 月 17 日",
      "slotName": "送洗单据：6月17日",
      "type": "fact"
    },
    {
      "id": "camera",
      "title": "相机编号",
      "detail": "机身记录为 X-071",
      "slotName": "相机编号：X-071",
      "type": "fact"
    },
    {
      "id": "note",
      "title": "匿名留言",
      "detail": "“不想让人认出”",
      "slotName": "匿名留言：不想让人认出",
      "type": "inference"
    },
    {
      "id": "scratch",
      "title": "划痕方向",
      "detail": "与旧邮筒边缘相似",
      "slotName": "划痕方向与邮筒边缘相似",
      "type": "inference"
    }
  ],
  "exposure": {
    "min": 10,
    "max": 100,
    "initial": 30,
    "readableMin": 52,
    "readableMax": 76,
    "visualBase": 0.25,
    "visualDivisor": 90
  },
  "progress": {
    "initial": 12,
    "readable": 38,
    "classified": 62,
    "checked": 82,
    "archived": 100
  },
  "text": [
    {
      "key": "exposureDark",
      "text": "第一步：向右拖动曝光，直到底片下方的日期和编号清楚但不过曝。"
    },
    {
      "key": "exposureReadable",
      "text": "细节进入可识别区间：底片下方出现日期与相机编号。接着在右侧选一条线索，归为事实或推断。"
    },
    {
      "key": "exposureOver",
      "text": "曝光过高，文字边缘开始丢失。向左微调可以恢复。"
    },
    {
      "key": "needSelect",
      "text": "先选择一条线索。"
    },
    {
      "key": "checkPass",
      "text": "沈砚核对：证据边界成立。日期与编号可直接核验，留言只支持动机推断。可以收录照片了。"
    },
    {
      "key": "checkFailExposure",
      "text": "核对未通过：底片还不在可识别区间。先把曝光调到日期和编号都清楚为止。"
    },
    {
      "key": "checkFailType",
      "text": "核对未通过：有线索放错了栏。能直接查到记录的是事实，需要靠关系去猜的是推断。"
    },
    {
      "key": "archived",
      "text": "第四卷底片已收录，照片墙变得清晰。点「重新开始」可以再修一次。"
    },
    {
      "key": "archiveToast",
      "text": "收录奖励已记录，同一底片重复修复不会重复发奖。"
    },
    {
      "key": "progressLabel",
      "text": "修复进度 {step}%"
    },
    {
      "key": "progressDone",
      "text": "照片已收录"
    },
    {
      "key": "archivedLocked",
      "text": "照片已收录。点「重新开始」可以再修一次。"
    },
    {
      "key": "playHint",
      "text": "目标：核对通过后收录照片。拖动曝光 → 选线索并归类 → 核对 → 收录，每一步都可以无成本回退。"
    }
  ]
};

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
      "text": "底片仍偏暗。提高曝光，直到编号边缘清楚但不过曝。"
    },
    {
      "key": "exposureReadable",
      "text": "细节进入可识别区间：底片下方出现日期与相机编号。"
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
      "text": "夏彦核对：证据边界成立。日期与编号可直接核验，留言只支持动机推断。"
    },
    {
      "key": "checkFail",
      "text": "核对未通过：确认底片处于可识别区间，并区分直接记录与关系推断。"
    },
    {
      "key": "archived",
      "text": "第四卷底片已归档。照片墙变得清晰，并解锁共同相册批注。"
    },
    {
      "key": "archiveToast",
      "text": "归档奖励已记录，同一底片重复修复不会重复发奖。"
    },
    {
      "key": "progressLabel",
      "text": "修复进度 {step}%"
    },
    {
      "key": "progressDone",
      "text": "照片已归档"
    }
  ]
};

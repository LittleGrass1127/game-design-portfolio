/* 自动生成：node tools/export-config.cjs —— 请修改 config/ 下的配置表，不要手改本文件 */
window.GAME_CONFIG = {
  "actionCards": [
    {
      "id": "rhetoric",
      "title": "辞令扩散",
      "description": "每层增加1个攻击/碰撞扩散目标（最多4目标），扩散半径每层+4。",
      "uiEffect": "攻击与碰撞扩散目标增加，最多4个。"
    },
    {
      "id": "insight",
      "title": "洞察磁场",
      "description": "每层拾取半径+8，赛车横向吸收范围+2.5%。",
      "uiEffect": "拾取范围与赛车回收范围扩大。"
    },
    {
      "id": "nerve",
      "title": "胆识驱动",
      "description": "每层步行移速+3.5%，赛车基础极速+1.8%。",
      "uiEffect": "步行移速与赛车极速提高。"
    },
    {
      "id": "craft",
      "title": "技术快充",
      "description": "每层射速+8%，赛车自然回充+0.7/秒。",
      "uiEffect": "自动攻击射速与赛车自然回充提高。"
    }
  ],
  "acts": [
    {
      "id": 1,
      "title": "雨夜码头",
      "kicker": "第一幕 · 02:17",
      "location": "自由港外锚地",
      "summary": "一封没有署名的邀请，三个人各有保留的帮助。先证明你有资格被当作问题。",
      "clock1": "02:17",
      "clock2": "02:46",
      "clock3": "03:12"
    },
    {
      "id": 2,
      "title": "玻璃宴厅",
      "kicker": "第二幕 · 夜宴未散",
      "location": "潮汐大厦顶层",
      "summary": "报价写在纸上，真正的条件坐在桌边。找出今晚到底是谁在投票。",
      "clock1": "03:48",
      "clock2": "04:13",
      "clock3": "04:51"
    },
    {
      "id": 3,
      "title": "地下机房",
      "kicker": "第三幕 · 潮线以下",
      "location": "旧海关地下一层",
      "summary": "晨星没有沉睡。它只是被一群从不接用户电话的人关掉了。",
      "clock1": "05:08",
      "clock2": "05:37",
      "clock3": "05:59"
    },
    {
      "id": 4,
      "title": "黎明议会",
      "kicker": "第四幕 · 第一班渡轮之前",
      "location": "自由港夜间理事会",
      "summary": "证据、能力与价格都已摆上桌。最后要回答的，是你准备用它们换什么。",
      "clock1": "06:18",
      "clock2": "06:36",
      "clock3": "06:51"
    }
  ],
  "buildStats": {
    "_说明": "buildStats(build) 的系数：行动卡 cards.* 与营地 rooms.* 的每层收益",
    "maxCards": 12,
    "maxRooms": 3,
    "moveSpeed": {
      "base": 174,
      "perNerve": 0.035
    },
    "damage": {
      "base": 18,
      "perWorkshop": 0.25
    },
    "attackInterval": {
      "base": 0.52,
      "perCraft": 0.08
    },
    "attackRange": {
      "base": 235,
      "perCommand": 28
    },
    "attackTargets": {
      "base": 1,
      "perRhetoric": 1,
      "max": 4
    },
    "spreadRadius": {
      "base": 64,
      "perRhetoric": 4
    },
    "pickupRange": {
      "base": 34,
      "perInsight": 8
    },
    "raceHitbox": {
      "base": 1,
      "perInsight": 0.025
    },
    "raceSpeed": {
      "base": 1,
      "perNerve": 0.018
    },
    "raceRegen": {
      "perCraft": 0.7
    },
    "hitRefill": {
      "base": 14,
      "perWorkshop": 2
    },
    "hitKick": {
      "base": 7,
      "perWorkshop": 1
    },
    "maxHealth": {
      "base": 100,
      "perInfirmary": 25
    },
    "repair": {
      "perInfirmary": 0.6
    },
    "stormResistance": {
      "perInfirmary": 0.35
    },
    "corridorBonus": {
      "perCommand": 12
    }
  },
  "campRooms": [
    {
      "slot": 1,
      "id": "command",
      "title": "指挥室",
      "module": "turbo",
      "description": "每层射程+28，夜雾安全走廊半宽+12。",
      "uiEffect": "每级射程 +28，夜雾安全走廊半宽 +12。"
    },
    {
      "slot": 2,
      "id": "workshop",
      "title": "工坊",
      "module": "magnet",
      "description": "每层攻击伤害+25%，撞车回能+2、加速反馈+1。",
      "uiEffect": "每级攻击伤害 +25%，回收回能 +2。"
    },
    {
      "slot": 3,
      "id": "infirmary",
      "title": "医务室",
      "module": "reactor",
      "description": "每层耐久上限+25、每秒修复0.6；风暴耗能除以1+0.35×层数。",
      "uiEffect": "每级耐久上限 +25、每秒修复 0.6，并减少风暴耗能。"
    }
  ],
  "characters": [
    {
      "id": "sun",
      "name": "孙哥",
      "role": "没有固定席位的竞标人",
      "pronoun": "他",
      "look": "深色长外套，领口松开一粒扣子，指间转着未署名的邀请卡；神情比衣着克制。",
      "description": "在不同的人口中，他可以是愿景、风险，或一个需要写进免责条款的名字。今晚的定义由你来做。",
      "ally": false
    },
    {
      "id": "counsel",
      "name": "晏律师",
      "role": "专门阅读句号之后的人",
      "pronoun": "她",
      "look": "短发，灰白西装，细框眼镜；随身的皮质文件夹磨旧了边角。",
      "description": "她愿意让一项决定站得住，却不愿替它假装干净。她最看重可以追溯的责任。",
      "ally": true
    },
    {
      "id": "engineer",
      "name": "乔工",
      "role": "晨星最后的值班工程师",
      "pronoun": "他",
      "look": "旧工装外罩雨衣，袖口有绝缘胶带，右手拎着不起眼的工具包。",
      "description": "他记得每一次停机，也记得那些不被写进报告的用户。需要他的，不只是你的计划。",
      "ally": true
    },
    {
      "id": "broker",
      "name": "莫小姐",
      "role": "替别人保管邀请函的中间人",
      "pronoun": "她",
      "look": "墨绿礼服，极简耳饰，浅色手套；总在谈话结束前把杯子放回托盘。",
      "description": "她不出售消息。她出售的是：在消息到来以前，坐在正确的位置。",
      "ally": true
    }
  ],
  "choiceConditions": {
    "reply_on_record": {
      "advantageIf": {
        "condition": {
          "trait": "抢先定义"
        },
        "reason": "抢先定义：你熟悉如何把一次谈话变成正式记录。"
      }
    },
    "inspect_invitation": {
      "advantageIf": {
        "condition": {
          "trait": "看见接口"
        },
        "reason": "看见接口：你辨认出机器打印与后来覆盖的痕迹。"
      }
    },
    "board_without_answer": {
      "advantageIf": {
        "condition": {
          "trait": "下一张牌"
        },
        "reason": "下一张牌：你习惯在条件齐备之前先抵达现场。"
      }
    },
    "read_omission": {
      "advantageIf": {
        "condition": {
          "trait": "读懂沉默"
        },
        "reason": "读懂沉默：你把缺席的签字当作一项信息。"
      }
    },
    "buy_clean_copy": {
      "required": {
        "resource": "capital",
        "gte": 2
      }
    },
    "compare_lists": {
      "advantageIf": {
        "condition": {
          "flag": "proxy_question"
        },
        "reason": "你已知道该找代理人，而不只是股东。"
      }
    },
    "enter_terrace": {
      "advantageIf": {
        "condition": {
          "relation": "broker",
          "gte": 1
        },
        "reason": "莫小姐愿意替你的出现提供一个合适的说法。"
      }
    },
    "enter_service": {
      "advantageIf": {
        "condition": {
          "item": "维修通行证"
        },
        "reason": "维修通行证能让你少解释一次为什么在这里。"
      }
    },
    "reserve_votes": {
      "required": {
        "resource": "capital",
        "gte": 3
      }
    },
    "follow_print_log": {
      "advantageIf": {
        "condition": {
          "relation": "engineer",
          "gte": 1
        },
        "reason": "乔工愿意解释值班系统里的内部简称。"
      }
    },
    "ask_joint_witness": {
      "required": {
        "any": [
          {
            "relation": "engineer",
            "gte": 1
          },
          {
            "trait": "抢先定义"
          },
          {
            "stat": "rhetoric",
            "gte": 4
          }
        ]
      }
    },
    "add_test_clause": {
      "modifier": {
        "condition": {
          "trait": "有据可引"
        },
        "value": 1,
        "reason": "有据可引：你练习过怎样把承诺写成可验收的条件。"
      },
      "advantageIf": {
        "condition": {
          "flag": "public_agenda"
        },
        "reason": "已有持票人要求把恢复方案写入议程。"
      }
    },
    "question_proxy": {
      "modifier": {
        "condition": {
          "flag": "shadow_mandate"
        },
        "value": 2,
        "reason": "你掌握了代理席位的实际控制痕迹。"
      }
    },
    "secure_bridge": {
      "advantageIf": {
        "condition": {
          "relation": "broker",
          "gte": 1
        },
        "reason": "莫小姐已见过你兑现一项不夸张的承诺。"
      }
    },
    "check_circuits": {
      "advantageIf": {
        "condition": {
          "any": [
            {
              "item": "维修通行证"
            },
            {
              "relation": "engineer",
              "gte": 2
            }
          ]
        },
        "reason": "你有维护入口，或得到乔工足够明确的协助。"
      }
    },
    "use_maintenance_log": {
      "required": {
        "any": [
          {
            "item": "封存维护日志"
          },
          {
            "item": "签发链副本"
          },
          {
            "trait": "读懂沉默"
          },
          {
            "flag": "shadow_mandate"
          }
        ],
        "description": "持有维护或签发记录，或拥有「读懂沉默」，或已掌握代理席位的线索"
      }
    },
    "preserve_evidence": {
      "modifier": {
        "condition": {
          "any": [
            {
              "item": "签发链副本"
            },
            {
              "item": "交接底稿"
            }
          ]
        },
        "value": 2,
        "reason": "外部记录能够与机房账目相互核对。"
      }
    },
    "map_open_access": {
      "advantageIf": {
        "condition": {
          "relation": "engineer",
          "gte": 2
        },
        "reason": "乔工愿意为你指出维护文档之外的实际限制。"
      }
    },
    "price_liabilities": {
      "modifier": {
        "condition": {
          "item": "保留意见"
        },
        "value": 2,
        "reason": "先前写明的责任边界让你有据可谈。"
      }
    },
    "run_minimal_test": {
      "advantageIf": {
        "condition": {
          "any": [
            {
              "flag": "safe_circuit"
            },
            {
              "item": "离线密钥"
            }
          ]
        },
        "reason": "已确认的回路或备用密钥降低了测试的不确定性。"
      }
    },
    "demonstrate_evidence": {
      "modifier": {
        "condition": {
          "flag": "audit_ready"
        },
        "value": 2,
        "reason": "核验过的总账提供了明确的验证对象。"
      }
    },
    "guarantee_maintenance": {
      "required": {
        "resource": "capital",
        "gte": 2
      }
    },
    "seat_counsel": {
      "required": {
        "all": [
          {
            "relation": "counsel",
            "gte": 1
          },
          {
            "not": {
              "flag": "counsel_withdrew"
            }
          }
        ],
        "description": "晏律师关系≥1，且她尚未退出联合陈述"
      },
      "advantageIf": {
        "condition": {
          "relation": "counsel",
          "gte": 3
        },
        "reason": "晏律师相信你会保留事实里的不方便。"
      }
    },
    "show_test_log": {
      "modifier": {
        "condition": {
          "any": [
            {
              "flag": "working_demo"
            },
            {
              "flag": "safe_rollback"
            }
          ]
        },
        "value": 2,
        "reason": "测试或回滚都有完整记录，不必靠回忆补齐。"
      }
    },
    "own_the_room": {
      "disadvantageIf": {
        "condition": {
          "resource": "pressure",
          "gte": 5
        },
        "reason": "连续积累的压力让你更难独自接住整桌人的问题。"
      }
    },
    "protect_disclosure": {
      "modifier": {
        "condition": {
          "flag": "proxy_on_record"
        },
        "value": 2,
        "reason": "代理席位的问题已经进入正式记录，无法轻易删去。"
      }
    },
    "protect_public_access": {
      "advantageIf": {
        "condition": {
          "any": [
            {
              "flag": "open_blueprint"
            },
            {
              "flag": "users_documented"
            }
          ]
        },
        "reason": "你能说清开放给谁，以及怎样开始运行。"
      }
    },
    "protect_control": {
      "modifier": {
        "condition": {
          "flag": "priced_liabilities"
        },
        "value": 2,
        "reason": "你已经给历史责任与恢复成本留出边界。"
      },
      "advantageIf": {
        "condition": {
          "relation": "broker",
          "gte": 2
        },
        "reason": "莫小姐愿意公开确认资金安排的可信度。"
      }
    },
    "final_control": {
      "modifier": {
        "condition": {
          "flag": "funded_offer"
        },
        "value": 2,
        "reason": "资金安排已经得到现场确认。"
      }
    },
    "final_open": {
      "modifier": {
        "condition": {
          "flag": "public_charter"
        },
        "value": 2,
        "reason": "公共节点与维护安排已经进入讨论文本。"
      },
      "advantageIf": {
        "condition": {
          "all": [
            {
              "relation": "engineer",
              "gte": 3
            },
            {
              "not": {
                "flag": "engineer_withdrew"
              }
            }
          ]
        },
        "reason": "乔工愿意与其他工程师共同承担持续运行。"
      }
    },
    "final_publish": {
      "modifier": {
        "condition": {
          "any": [
            {
              "flag": "audit_ready"
            },
            {
              "flag": "independent_custody"
            }
          ]
        },
        "value": 2,
        "reason": "资料有可核验来源，或已脱离单方保管。"
      },
      "advantageIf": {
        "condition": {
          "all": [
            {
              "relation": "counsel",
              "gte": 3
            },
            {
              "not": {
                "flag": "counsel_withdrew"
              }
            }
          ]
        },
        "reason": "晏律师愿意为卷宗的来源与限定范围作正式说明。"
      }
    }
  },
  "choices": [
    {
      "id": "reply_on_record",
      "scene": "dock_invitation",
      "skill": "rhetoric",
      "dc": 10,
      "label": "让接驳艇替你带回一份正式回函",
      "intent": "先留下自己被邀请的记录，再登岸。"
    },
    {
      "id": "inspect_invitation",
      "scene": "dock_invitation",
      "skill": "craft",
      "dc": 11,
      "label": "查验邀请卡边缘那串不合时宜的时间戳",
      "intent": "确认这份邀请是何时进入港口系统的。"
    },
    {
      "id": "board_without_answer",
      "scene": "dock_invitation",
      "skill": "nerve",
      "dc": 10,
      "label": "不作答复，直接坐到艇长对面",
      "intent": "用已经在场的事实，换掉等待许可。"
    },
    {
      "id": "retain_counsel",
      "scene": "dock_counsel",
      "skill": "rhetoric",
      "dc": 11,
      "label": "请她把每一处保留意见写在你的签名旁",
      "intent": "用可追溯的责任边界换取她的支持。"
    },
    {
      "id": "read_omission",
      "scene": "dock_counsel",
      "skill": "insight",
      "dc": 12,
      "label": "追问文件为什么没有列出目前的控制人",
      "intent": "从被省略的主体，反推今晚的交易结构。"
    },
    {
      "id": "buy_clean_copy",
      "scene": "dock_counsel",
      "skill": "nerve",
      "dc": 10,
      "label": "付出一部分预算，取得有签章的交接底稿",
      "intent": "不靠口头保证，购买一份可独立核验的记录。"
    },
    {
      "id": "help_engineer",
      "scene": "dock_manifest",
      "skill": "craft",
      "dc": 11,
      "label": "先替乔工固定电源，再问它要送往哪里",
      "intent": "用一次实际帮忙换取地下机房的入口。"
    },
    {
      "id": "compare_lists",
      "scene": "dock_manifest",
      "skill": "insight",
      "dc": 11,
      "label": "对照莫小姐手中的人名与货运编号",
      "intent": "找出被藏在物流名目里的投票关系。"
    },
    {
      "id": "enter_terrace",
      "scene": "banquet_foyer",
      "skill": "rhetoric",
      "dc": 11,
      "label": "请莫小姐把你引到持票人的露台",
      "intent": "从公开的社交关系里寻找实际决策者。"
    },
    {
      "id": "enter_service",
      "scene": "banquet_foyer",
      "skill": "craft",
      "dc": 11,
      "label": "推着工具车，从服务走廊进入",
      "intent": "沿着设备与工作人员的路线观察权力。"
    },
    {
      "id": "read_hesitation",
      "scene": "banquet_terrace",
      "skill": "insight",
      "dc": 12,
      "label": "绕开价格，问谁能批准临时恢复服务",
      "intent": "用一个实际决定，试出他们权力的边界。"
    },
    {
      "id": "make_public_offer",
      "scene": "banquet_terrace",
      "skill": "rhetoric",
      "dc": 12,
      "label": "提出一份允许他们公开署名的恢复方案",
      "intent": "给他们一个离开幕后安排的理由。"
    },
    {
      "id": "reserve_votes",
      "scene": "banquet_terrace",
      "skill": "nerve",
      "dc": 12,
      "label": "用托管资金换取两张票的暂缓承诺",
      "intent": "花费预算，为最终谈判保留时间。"
    },
    {
      "id": "follow_print_log",
      "scene": "banquet_service",
      "skill": "craft",
      "dc": 12,
      "label": "请值班员核对指令的签发链",
      "intent": "留下可被别人重复核验的控制记录。"
    },
    {
      "id": "listen_to_staff",
      "scene": "banquet_service",
      "skill": "insight",
      "dc": 11,
      "label": "把值班员没说完的那句话听完",
      "intent": "先了解停机给谁带来了损失。"
    },
    {
      "id": "ask_joint_witness",
      "scene": "banquet_service",
      "skill": "rhetoric",
      "dc": 11,
      "label": "请乔工与值班员共同封存一份维护日志",
      "intent": "用两名见证人，保护这份容易消失的记录。"
    },
    {
      "id": "add_test_clause",
      "scene": "banquet_table",
      "skill": "rhetoric",
      "dc": 13,
      "label": "要求所有报价都附带同一场公开通电测试",
      "intent": "让技术事实成为每一位竞标人的共同门槛。"
    },
    {
      "id": "question_proxy",
      "scene": "banquet_table",
      "skill": "insight",
      "dc": 13,
      "label": "要求主持人说明代理席位究竟代表谁",
      "intent": "在所有人面前，留下一个必须回答的问题。"
    },
    {
      "id": "secure_bridge",
      "scene": "banquet_table",
      "skill": "nerve",
      "dc": 12,
      "label": "请莫小姐安排一笔以测试成功为条件的过桥款",
      "intent": "为后半夜保留资金，同时承担她的条件。"
    },
    {
      "id": "check_circuits",
      "scene": "machine_gate",
      "skill": "craft",
      "dc": 12,
      "label": "按维护记录逐段确认回路，再进入主机区",
      "intent": "花时间降低恢复过程里的实际风险。"
    },
    {
      "id": "organize_manual_shift",
      "scene": "machine_gate",
      "skill": "rhetoric",
      "dc": 12,
      "label": "把乔工的步骤复述清楚，组织一次人工值守",
      "intent": "承认技术边界，用明确分工推进工作。"
    },
    {
      "id": "use_maintenance_log",
      "scene": "machine_gate",
      "skill": "insight",
      "dc": 11,
      "label": "用封存日志核对那次异常停机",
      "intent": "先证明这是一场可逆的停机，而非设备报废。"
    },
    {
      "id": "preserve_evidence",
      "scene": "machine_ledger",
      "skill": "insight",
      "dc": 13,
      "label": "按时间、来源与见证人整理两套总账",
      "intent": "将疑点转化为能够公开核验的证据。"
    },
    {
      "id": "map_open_access",
      "scene": "machine_ledger",
      "skill": "craft",
      "dc": 13,
      "label": "让乔工标出可以先恢复给公共节点的容量",
      "intent": "不等待全部归属解决，先形成最小开放方案。"
    },
    {
      "id": "price_liabilities",
      "scene": "machine_ledger",
      "skill": "nerve",
      "dc": 13,
      "label": "逐项给恢复成本与历史责任定价",
      "intent": "准备一份有边界、有储备的接管报价。"
    },
    {
      "id": "run_minimal_test",
      "scene": "machine_bypass",
      "skill": "craft",
      "dc": 13,
      "label": "只验证最小通路，让诊所先发回一份数据",
      "intent": "用有限但真实的运行结果支撑开放方案。"
    },
    {
      "id": "demonstrate_evidence",
      "scene": "machine_bypass",
      "skill": "insight",
      "dc": 13,
      "label": "请晏律师与值班员见证停机指令的实际效果",
      "intent": "让总账里的控制关系在现实中得到一次验证。"
    },
    {
      "id": "guarantee_maintenance",
      "scene": "machine_bypass",
      "skill": "nerve",
      "dc": 12,
      "label": "拿出一部分资金，为测试后的连续值守作担保",
      "intent": "把接管意愿落实成会被兑现的维护预算。"
    },
    {
      "id": "seat_counsel",
      "scene": "council_witness",
      "skill": "rhetoric",
      "dc": 13,
      "label": "请晏律师作为联合陈述人坐到桌前",
      "intent": "接受她公开纠正你的权利，以换取证言的可信度。"
    },
    {
      "id": "show_test_log",
      "scene": "council_witness",
      "skill": "craft",
      "dc": 13,
      "label": "逐页展示测试日志，让在场的人自己提问",
      "intent": "用可验证的过程代替一场完美表演。"
    },
    {
      "id": "own_the_room",
      "scene": "council_witness",
      "skill": "nerve",
      "dc": 13,
      "label": "独自陈述，同时把所有可核验附件交给书记员",
      "intent": "承担主要质询，把发言权与证据分开。"
    },
    {
      "id": "protect_disclosure",
      "scene": "council_offer",
      "skill": "insight",
      "dc": 14,
      "label": "把资料披露与独立复核写成表决的前置条件",
      "intent": "不以控制权换取对旧账的沉默。"
    },
    {
      "id": "protect_public_access",
      "scene": "council_offer",
      "skill": "rhetoric",
      "dc": 14,
      "label": "要求把公共节点与维护席位写进新章程",
      "intent": "让开放不只依赖下一任控制人的善意。"
    },
    {
      "id": "protect_control",
      "scene": "council_offer",
      "skill": "nerve",
      "dc": 14,
      "label": "把维护储备与表决权重新打包，提出最后报价",
      "intent": "用能够兑现的资金安排争取明确控制权。"
    },
    {
      "id": "final_control",
      "scene": "council_verdict",
      "skill": "rhetoric",
      "dc": 14,
      "label": "提交有责任边界的最终接管报价",
      "intent": "接管目标：结算时资本≥4、声望≥3、压力<6。本次结果仍会改变数值。"
    },
    {
      "id": "final_open",
      "scene": "council_verdict",
      "skill": "craft",
      "dc": 14,
      "label": "提交公共接入与共同维护的开放章程",
      "intent": "开放目标：结算时声望≥4、乔工关系≥1、压力<6，且乔工未退出支持。"
    },
    {
      "id": "final_publish",
      "scene": "council_verdict",
      "skill": "insight",
      "dc": 14,
      "label": "将可核验卷宗递交独立保管与公开审查",
      "intent": "审查目标：结算时筹码≥4、晏律师关系≥1、压力<6，且她未退出支持。"
    }
  ],
  "combatActs": [
    {
      "act": 1,
      "enemiesPerWave": 5,
      "enemyHp": 32,
      "enemySpeedMin": 36,
      "enemySpeedJitter": 7,
      "contactDamage": 4,
      "scrapValue": 2
    },
    {
      "act": 2,
      "enemiesPerWave": 6,
      "enemyHp": 38,
      "enemySpeedMin": 40,
      "enemySpeedJitter": 7,
      "contactDamage": 5,
      "scrapValue": 2
    },
    {
      "act": 3,
      "enemiesPerWave": 7,
      "enemyHp": 44,
      "enemySpeedMin": 44,
      "enemySpeedJitter": 7,
      "contactDamage": 6,
      "scrapValue": 3
    },
    {
      "act": 4,
      "enemiesPerWave": 8,
      "enemyHp": 50,
      "enemySpeedMin": 48,
      "enemySpeedJitter": 7,
      "contactDamage": 7,
      "scrapValue": 3
    }
  ],
  "combat": {
    "_说明": "合同远征：无人机波次与耐久。逐幕数值见 combat-acts.csv",
    "waves": 3,
    "firstWaveAt": 0.75,
    "waveInterval": 6.5,
    "spawnRadius": [
      185,
      75
    ],
    "spawnMinGap": 170,
    "hurtCooldown": 0.65,
    "enemyRadius": 10,
    "pickupRadius": 5,
    "pickupPullSpeed": 230
  },
  "endings": [
    {
      "id": "crisis",
      "title": "没有给你的那把椅子",
      "kicker": "结局一 · 压力超过了可承受的边界",
      "condition": {
        "resource": "pressure",
        "gte": 6
      },
      "body": [
        "决定散落在太多互相牵制的承诺里。书记员逐一念出尚未解决的异议，你发现自己已经很难回答一个问题，而不让另一个问题重新出现。",
        "理事会没有采纳你的最后文本。晨星的处置被交回临时程序，你的名字作为“未形成充分可执行提案的竞标人”留在会议记录中。",
        "走出门时，港口已经开始上班。孙哥没有对等待的人发表感言。他先把这一夜答应过的事列在纸上。失败终于变得具体，也因此第一次可以被处理。"
      ]
    },
    {
      "id": "public_record",
      "title": "让黎明成为证人",
      "kicker": "结局二 · 独立审查启动",
      "condition": {
        "all": [
          {
            "flag": "intent_publish",
            "value": true
          },
          {
            "resource": "leverage",
            "gte": 4
          },
          {
            "relation": "counsel",
            "gte": 1
          },
          {
            "not": {
              "flag": "counsel_withdrew"
            }
          }
        ]
      },
      "body": [
        "足够的来源、相互印证的记录和愿意署名的人，使卷宗通过了第一道审查。理事会不得不保全代理席位与停机安排的相关材料，原定处置也因此暂停。",
        "没有人当场认错。晏律师说，那不是程序工作的方式。接下来的争论会很长，有些结论也可能比你预想的窄。但它们终于不必只由一间关着门的房间给出。",
        "孙哥没有拿到晨星。离岸诊所仍在等待恢复日期。你带走的是一张送达回执，以及不能再随意撤回的共同责任。今早，它们比胜利的照片更难伪造。"
      ]
    },
    {
      "id": "open_protocol",
      "title": "每一个节点都有名字",
      "kicker": "结局三 · 晨星共同维护",
      "condition": {
        "all": [
          {
            "flag": "intent_open",
            "value": true
          },
          {
            "resource": "reputation",
            "gte": 4
          },
          {
            "relation": "engineer",
            "gte": 1
          },
          {
            "not": {
              "flag": "engineer_withdrew"
            }
          }
        ]
      },
      "body": [
        "开放章程得到足够支持，晨星先向少量公共节点恢复服务。权限不属于某一个永远正确的人；新增接入、故障停机与维护预算，都必须留下记录。",
        "乔工在第一张值班表上写下自己的名字，也给你留了一栏。那一栏不是创始人，更不是精神领袖，只写着“资源协调”。你问几点交班，他说先把第一班做完。",
        "屏幕上陆续亮起诊所、救援站与港口气象台。孙哥看了一会儿，把准备发表的那段话删短了。机器没有理解你的雄心，但终于开始回应别人的需要。"
      ]
    },
    {
      "id": "steward",
      "title": "一把附带账单的钥匙",
      "kicker": "结局四 · 获得晨星控制权",
      "condition": {
        "all": [
          {
            "flag": "intent_control",
            "value": true
          },
          {
            "resource": "capital",
            "gte": 4
          },
          {
            "resource": "reputation",
            "gte": 3
          }
        ]
      },
      "body": [
        "资金、信誉与责任安排撑住了最后的报价。晨星的控制权依照新文本交接，你得到的不是一片没有边界的天空，而是一叠需要按时兑现的维护、披露与治理义务。",
        "莫小姐留下的回执贴着那笔资金的真实条件。你想起她对价格的提醒，把第一场复核写进日程。与此同时，机房送来一份比祝贺更早的消息：备用电池的钱什么时候到账。",
        "孙哥坐进那把一整夜空着的椅子，发现座位并不比别处柔软。窗外开始有人工作。属于你的下一步，不是宣布未来，而是批准第一笔正确的支出。"
      ]
    },
    {
      "id": "withdrawal",
      "title": "没有签下去的那一页",
      "kicker": "结局五 · 保留退出与再来的资格",
      "condition": {},
      "body": [
        "最后的方案没有凑齐它需要的支持。有人缺的是钱，有人缺的是证据，有人直到黎明才发现，替自己说话的人已经不愿再替自己作证。",
        "你接受这一结果，没有用临时添加的承诺补齐缺口。已经核验的材料照常交接，能够兑现的维护安排照常执行，剩下的争议留在清楚的边界之内。",
        "渡轮靠岸时，孙哥把那支笔放回口袋。退出并不使这一夜自动变得高尚，也不抹掉它的成本。它只保住了一件有用的东西：下次坐到桌前时，你仍能准确说出自己能做什么。"
      ]
    }
  ],
  "exploreMaps": {
    "_说明": "合同远征地图：每幕 3 个合同节点（线索/同伴/出口）按顺序解锁",
    "bounds": {
      "x": 42,
      "y": 88,
      "w": 876,
      "h": 402
    },
    "objectiveRadius": 32,
    "objectiveRewards": [
      {
        "capital": 1
      },
      {
        "leverage": 1
      },
      {
        "reputation": 1
      }
    ],
    "maps": [
      {
        "id": "rain-dock",
        "title": "雨夜码头",
        "theme": "dock",
        "start": {
          "x": 105,
          "y": 435
        },
        "obstacles": [
          {
            "x": 305,
            "y": 208,
            "w": 150,
            "h": 80,
            "kind": "crate"
          },
          {
            "x": 548,
            "y": 104,
            "w": 143,
            "h": 108,
            "kind": "customs"
          },
          {
            "x": 190,
            "y": 331,
            "w": 68,
            "h": 78,
            "kind": "crate"
          }
        ],
        "objectives": [
          {
            "x": 174,
            "y": 142,
            "title": "查验邀请函",
            "description": "在雨棚下核对登船记录。",
            "kind": "clue"
          },
          {
            "x": 766,
            "y": 365,
            "title": "找到晏律师",
            "description": "带着交接记录与晏律师碰面。",
            "kind": "ally"
          },
          {
            "x": 803,
            "y": 135,
            "title": "接驳艇入口",
            "description": "材料齐备后前往玻璃宴厅。",
            "kind": "exit"
          }
        ]
      },
      {
        "id": "glass-banquet",
        "title": "玻璃宴厅",
        "theme": "banquet",
        "start": {
          "x": 104,
          "y": 438
        },
        "obstacles": [
          {
            "x": 272,
            "y": 184,
            "w": 155,
            "h": 90,
            "kind": "table"
          },
          {
            "x": 555,
            "y": 295,
            "w": 173,
            "h": 90,
            "kind": "table"
          },
          {
            "x": 652,
            "y": 103,
            "w": 104,
            "h": 72,
            "kind": "bar"
          }
        ],
        "objectives": [
          {
            "x": 172,
            "y": 142,
            "title": "核对访客名册",
            "description": "找到真正持有代理票的人。",
            "kind": "clue"
          },
          {
            "x": 806,
            "y": 245,
            "title": "会合莫小姐",
            "description": "绕过宴席，把条件谈到桌面上。",
            "kind": "ally"
          },
          {
            "x": 435,
            "y": 429,
            "title": "取得机房授权",
            "description": "从服务通道前往地下机房。",
            "kind": "exit"
          }
        ]
      },
      {
        "id": "machine-room",
        "title": "地下机房",
        "theme": "machine",
        "start": {
          "x": 110,
          "y": 439
        },
        "obstacles": [
          {
            "x": 251,
            "y": 135,
            "w": 75,
            "h": 215,
            "kind": "server"
          },
          {
            "x": 452,
            "y": 217,
            "w": 78,
            "h": 220,
            "kind": "server"
          },
          {
            "x": 661,
            "y": 123,
            "w": 90,
            "h": 199,
            "kind": "server"
          }
        ],
        "objectives": [
          {
            "x": 148,
            "y": 153,
            "title": "检查隔离开关",
            "description": "先确认停止条件，再接通电源。",
            "kind": "clue"
          },
          {
            "x": 591,
            "y": 157,
            "title": "与乔工核对日志",
            "description": "绕过机柜，取得完整的维护记录。",
            "kind": "ally"
          },
          {
            "x": 824,
            "y": 406,
            "title": "提交测试报告",
            "description": "把记录带到黎明议会。",
            "kind": "exit"
          }
        ]
      },
      {
        "id": "dawn-council",
        "title": "黎明议会",
        "theme": "council",
        "start": {
          "x": 110,
          "y": 442
        },
        "obstacles": [
          {
            "x": 248,
            "y": 259,
            "w": 161,
            "h": 78,
            "kind": "bench"
          },
          {
            "x": 552,
            "y": 259,
            "w": 161,
            "h": 78,
            "kind": "bench"
          },
          {
            "x": 370,
            "y": 117,
            "w": 222,
            "h": 71,
            "kind": "council-table"
          }
        ],
        "objectives": [
          {
            "x": 172,
            "y": 155,
            "title": "递交原始卷宗",
            "description": "让证据先于陈述抵达书记席。",
            "kind": "clue"
          },
          {
            "x": 802,
            "y": 156,
            "title": "召集共同见证",
            "description": "与留下来的同伴确认最后的承诺。",
            "kind": "ally"
          },
          {
            "x": 482,
            "y": 419,
            "title": "走向表决席",
            "description": "所有准备就绪，决定晨星的未来。",
            "kind": "exit"
          }
        ]
      }
    ]
  },
  "interludes": [
    {
      "act": 1,
      "slot": 1,
      "id": "learn_record",
      "title": "让话留下依据",
      "rhetoric": 1,
      "insight": null,
      "nerve": null,
      "craft": null,
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": null,
      "trained": null,
      "traits": "有据可引",
      "description": "辞令 +1；获得「有据可引」。你练习在承诺后面补上一个可以核验的日期。"
    },
    {
      "act": 1,
      "slot": 2,
      "id": "learn_footnote",
      "title": "读到附录最后一行",
      "rhetoric": null,
      "insight": 1,
      "nerve": null,
      "craft": null,
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": null,
      "trained": "insight",
      "traits": null,
      "description": "洞察 +1；获得洞察熟练，已拥有则不叠加。晏律师教你区分缺失的信息与被隐藏的信息。"
    },
    {
      "act": 1,
      "slot": 3,
      "id": "keep_margin",
      "title": "留出没有花完的余地",
      "rhetoric": null,
      "insight": null,
      "nerve": null,
      "craft": null,
      "capital": 3,
      "reputation": null,
      "leverage": null,
      "pressure": -1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": 1,
      "trained": null,
      "traits": null,
      "description": "资本 +3，压力 -1，改口 +1。你取消一项只为好看的开销。"
    },
    {
      "act": 2,
      "slot": 1,
      "id": "learn_maintenance",
      "title": "把步骤讲给乔工听",
      "rhetoric": null,
      "insight": null,
      "nerve": null,
      "craft": 1,
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": null,
      "trained": "craft",
      "traits": null,
      "description": "技术 +1；获得技术熟练，已拥有则不叠加。能说清如何停止，才有资格说如何开始。"
    },
    {
      "act": 2,
      "slot": 2,
      "id": "learn_responsibility",
      "title": "与晏律师交换批注",
      "rhetoric": null,
      "insight": 1,
      "nerve": null,
      "craft": null,
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": null,
      "trained": null,
      "traits": null,
      "description": "洞察 +1；晏律师关系 +1。你保留了那一段不利于自己的事实。"
    },
    {
      "act": 2,
      "slot": 3,
      "id": "learn_reserve",
      "title": "重新计算最坏的预算",
      "rhetoric": null,
      "insight": null,
      "nerve": null,
      "craft": null,
      "capital": 3,
      "reputation": null,
      "leverage": null,
      "pressure": -2,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": null,
      "trained": null,
      "traits": null,
      "description": "资本 +3，压力 -2。承认缺口以后，剩下的资源反而更清楚。"
    },
    {
      "act": 3,
      "slot": 1,
      "id": "learn_answer",
      "title": "排练最不愿被问到的问题",
      "rhetoric": 1,
      "insight": null,
      "nerve": 1,
      "craft": null,
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": null,
      "trained": null,
      "traits": null,
      "description": "胆识 +1，辞令 +1。你删掉了一句没有办法负责的漂亮话。"
    },
    {
      "act": 3,
      "slot": 2,
      "id": "learn_joint_signature",
      "title": "把下一班值守也安排进去",
      "rhetoric": null,
      "insight": null,
      "nerve": null,
      "craft": null,
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "fate": null,
      "trained": null,
      "traits": null,
      "description": "声望 +2；乔工关系 +1。你们约定，散会以后仍有人留在机房。"
    },
    {
      "act": 3,
      "slot": 3,
      "id": "learn_pause",
      "title": "在黎明前留一分钟沉默",
      "rhetoric": null,
      "insight": null,
      "nerve": null,
      "craft": null,
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": -2,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "fate": 1,
      "trained": null,
      "traits": null,
      "description": "压力 -2，筹码 +1，改口 +1。先确认事实，再决定最后怎样表达。"
    }
  ],
  "meta": {
    "title": "二十面野心",
    "subtitle": "孙哥纪事 · 一份尚未生效的黎明",
    "disclaimer": "这是一部原创架空金融黑色寓言。“孙哥”是虚构的公众形象原型；人物、组织、交易、对白与事件均为创作，不构成对任何现实人物或事件的事实陈述。"
  },
  "origins": [
    {
      "id": "orator",
      "title": "演说家",
      "description": "你总能先说出那句后来被当作会议结论的话。但定义一件事，与承担它，是两门不同的手艺。",
      "stat": "rhetoric",
      "statBonus": 2,
      "trained": "rhetoric",
      "trait": "抢先定义"
    },
    {
      "id": "hunter",
      "title": "协议猎手",
      "description": "你读合同的顺序是附录、脚注、签字，再到封面。沉默有时比条款更接近真实价格。",
      "stat": "insight",
      "statBonus": 2,
      "trained": "insight",
      "trait": "读懂沉默"
    },
    {
      "id": "founder",
      "title": "连续创业者",
      "description": "你擅长在账户见底前找到下一张桌子。今晚，你想试一次不把代价留给后来的人。",
      "stat": "nerve",
      "statBonus": 2,
      "trained": "nerve",
      "trait": "下一张牌"
    },
    {
      "id": "engineer",
      "title": "工程叛徒",
      "description": "你曾替别人把愿景接进电源，后来发现，最重要的开关从不画在结构图里。",
      "stat": "craft",
      "statBonus": 2,
      "trained": "craft",
      "trait": "看见接口"
    }
  ],
  "outcomes": [
    {
      "choice": "reply_on_record",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "invitation_recorded",
      "items": null,
      "next": "dock_counsel",
      "text": "艇长用无线电复述了你的全名，并要求岸边确认。一个沉默的频道终于回答“收到”。你还没有入场，却已经不容易被说成从未来过。"
    },
    {
      "choice": "reply_on_record",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "invitation_disputed",
      "items": null,
      "next": "dock_counsel",
      "text": "艇长只肯记录“另有一名乘客”。你把回函交给他，纸面留下了雨水和指印。邀请依然有效，只是今晚第一处空白，已经有人替你保留。"
    },
    {
      "choice": "inspect_invitation",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "late_invitation",
      "items": "时间戳副本",
      "next": "dock_counsel",
      "text": "邀请比送达早了整整一场晚宴。覆盖层下面还留着旧海关的收件号。你保存了副本：有人需要你到场，却希望你来不及准备。"
    },
    {
      "choice": "inspect_invitation",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "截断的收件号",
      "next": "dock_counsel",
      "text": "盐水让最后两位编号消失了。你只来得及抄下“旧海关”，接驳艇便鸣了一声笛。线索足够让你上岸，尚不足以让任何人承认它。"
    },
    {
      "choice": "board_without_answer",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "vacant_seat",
      "items": null,
      "next": "dock_counsel",
      "text": "艇长问你属于哪一桌。你说：“让他们多摆一把椅子。”他没有再问，只把岸边的访客名单递过来供你核对。上面有一个名字被整齐地划掉了。"
    },
    {
      "choice": "board_without_answer",
      "result": "failure",
      "capital": null,
      "reputation": -1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": null,
      "next": "dock_counsel",
      "text": "你的鞋还没有站稳，艇长便关了登船灯。你最终还是上了艇，只是整段航程都坐在溅水的船尾。岸边的人会先听说你的不耐烦，再听到你的名字。"
    },
    {
      "choice": "retain_counsel",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "counsel_retained",
      "items": "保留意见",
      "next": "dock_manifest",
      "text": "你没有删掉责任，而是要求它有起止时间、有交接人。晏律师在旁边落下自己的名字。“现在这至少是一份能拿去争论的文件。”"
    },
    {
      "choice": "retain_counsel",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "免责条款批注",
      "next": "dock_manifest",
      "text": "你的措辞听上去仍像把风险往后推。她拒绝联合署名，却把有问题的三行划了出来。“我会进去。至于站在哪一边，要看你下一次怎样回答。”"
    },
    {
      "choice": "read_omission",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": 2,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "proxy_question",
      "items": null,
      "next": "dock_manifest",
      "text": "晏律师第一次正眼看你。文件把卖方写成“代表有关权益的各方”，没有任何一方承认自己持有控制权。她留下一句提示：“去查代理票。别只查股份。”"
    },
    {
      "choice": "read_omission",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "proxy_question",
      "items": null,
      "next": "dock_manifest",
      "text": "你找到了缺口，却把委托人和受益人混作一谈。她耐心纠正，两人的时间也因此少了一截。“记住这两个词。宴会上有人靠你分不清它们赚钱。”"
    },
    {
      "choice": "buy_clean_copy",
      "result": "success",
      "capital": -2,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "交接底稿",
      "next": "dock_manifest",
      "text": "窗口里的人本来只肯卖复印件。你把付款条件写成“原件核对后生效”，他终于取出了装订本。晏律师没有赞许，只替你确认了最后一枚章。"
    },
    {
      "choice": "buy_clean_copy",
      "result": "failure",
      "capital": -2,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "缺页证明",
      "next": "dock_manifest",
      "text": "钱付了，装订本也打开了，最关键的一页却标着“另附”。你拿到了空缺本身的证明。晏律师替那一页拍照，说缺席有时也需要留证。"
    },
    {
      "choice": "help_engineer",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": null,
      "items": "维修通行证",
      "next": "banquet_foyer",
      "text": "你找对了受力点，电池没有压伤接口。乔工把一张维修通行证塞进你手里。“别弄丢。上面的人可以撤回邀请，下面的机器不认这一套。”"
    },
    {
      "choice": "help_engineer",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "访客贴纸",
      "next": "banquet_foyer",
      "text": "你的固定带绕反了，乔工不得不重新拆开。你没有推给搬运工，而是一直托到他做完。他给了你一张访客贴纸：“门我会开。进去以后，别替机器作保证。”"
    },
    {
      "choice": "compare_lists",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": "linked_proxies",
      "items": null,
      "next": "banquet_foyer",
      "text": "同一个编号出现在三位持票人的行李下面。莫小姐合上名单，却没有收走你已经看见的那一页。“到了宴厅，别问他们认识谁。问谁替他们保管证件。”"
    },
    {
      "choice": "compare_lists",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "proxies_alerted",
      "items": null,
      "next": "banquet_foyer",
      "text": "你念错了其中一个名字。莫小姐礼貌地替你纠正，周围的谈话却停了一瞬。她仍告诉你入口在哪；从这一刻起，里面的人也知道你在找什么。"
    },
    {
      "choice": "enter_terrace",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": null,
      "items": null,
      "next": "banquet_terrace",
      "text": "她介绍你时没有使用任何夸张的头衔，只说你“带来一份可执行的提案”。露台上有人挪开了椅子。那句话比名片更快地换来了一小块位置。"
    },
    {
      "choice": "enter_terrace",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": -1,
      "flags": null,
      "items": null,
      "next": "banquet_terrace",
      "text": "你铺垫得太久，主持人把你当成了下一轮致辞的人。莫小姐没有拆穿，只替你关掉麦克风。你仍进入露台，不过需要先忍受几句过分热情的恭维。"
    },
    {
      "choice": "enter_service",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": null,
      "items": null,
      "next": "banquet_service",
      "text": "你把电源接口朝外摆好，门禁员只扫了一眼便放行。乔工示意你看墙上的值班表：宴会可以换宾客，今晚的指令却始终来自同一间空房。"
    },
    {
      "choice": "enter_service",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": null,
      "next": "banquet_service",
      "text": "工具车卡在门槛上，警卫叫来了主管。乔工说你是临时助手，把一只最沉的箱子交给你。你得到了入口，也得到了整个走廊对你笨拙背影的印象。"
    },
    {
      "choice": "read_hesitation",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": "shadow_mandate",
      "items": null,
      "next": "banquet_table",
      "text": "三个人给出了三个职务，最后却都望向同一间小会客室。你终于确认：他们有权出售未来的收益，却没有权让机器现在通电。莫小姐在你的杯垫上写下了房号。"
    },
    {
      "choice": "read_hesitation",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "mandate_suspected",
      "items": null,
      "next": "banquet_table",
      "text": "你把试探说得太直，对方立即开始背诵章程。但背诵的人漏掉了“受托”两个字，又急着补上。你没有拿到名字，却听清了他们并不完全拥有自己的票。"
    },
    {
      "choice": "make_public_offer",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": "public_agenda",
      "items": null,
      "next": "banquet_table",
      "text": "你只承诺两个可核验的日期，没有承诺伟大。最年长的持票人终于拿起酒杯。“把这一段写进议程。”莫小姐看你的眼神，像在重新估算今晚的长度。"
    },
    {
      "choice": "make_public_offer",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "refusal_recorded",
      "items": null,
      "next": "banquet_table",
      "text": "他们说方案很好，应该交给一个更合适的委员会。你请秘书原样记下这句答复。推诿没有结束，只是第一次出现在一份带日期的记录里。"
    },
    {
      "choice": "reserve_votes",
      "result": "success",
      "capital": -3,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "votes_delayed",
      "items": "托管回执",
      "next": "banquet_table",
      "text": "钱没有进任何人的口袋，而是进了带时限的托管账户。两位持票人答应在你完成陈述前不提前离席。莫小姐替你保留了回执：“你买到的不是赞成，是他们不能再装作没听见。”"
    },
    {
      "choice": "reserve_votes",
      "result": "failure",
      "capital": -3,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "单方回执",
      "next": "banquet_table",
      "text": "托管费照收，承诺却只留下一个签名。另一位持票人已经接起电话。你至少把一把椅子留到了天亮，至于它值不值这个价，只能稍后回答。"
    },
    {
      "choice": "follow_print_log",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "shadow_mandate",
      "items": "签发链副本",
      "next": "banquet_table",
      "text": "签发链没有通向某位股东，而是通向一个代理席位。你请值班员在复印件上注明出处。乔工点头：“这样即使我不在场，这一页也能自己说话。”"
    },
    {
      "choice": "follow_print_log",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "staff_witness",
      "items": null,
      "next": "banquet_table",
      "text": "旧打印机把最后一行吃了进去。值班员不肯重打，却愿意在缺口边签下自己的工号。完整文件没有拿到，一个可能作证的人因此留了下来。"
    },
    {
      "choice": "listen_to_staff",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "users_documented",
      "items": "诊所通信账单",
      "next": "banquet_table",
      "text": "值班员的妹妹在离岸诊所工作。晨星停机之后，他们每晚都要借别人的窄带线路传影像。你记下的不是一段动人的故事，而是账单、时间与可以回访的地址。"
    },
    {
      "choice": "listen_to_staff",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": -1,
      "rel_broker": null,
      "flags": null,
      "items": "诊所通信账单",
      "next": "banquet_table",
      "text": "对方以为你又在寻找一段可以放进演讲的遭遇。直到你收起记录本，他才把一张账单塞给乔工。信任没有直接交到你手里，线索仍然跟着你走了。"
    },
    {
      "choice": "ask_joint_witness",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": null,
      "items": "封存维护日志",
      "next": "banquet_table",
      "text": "你把谁保管、谁复核、谁有权拆封讲清楚，才请他们签字。胶封合上时，乔工终于不再把你当作一位暂时好奇的来宾。"
    },
    {
      "choice": "ask_joint_witness",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "distributed_notes",
      "items": null,
      "next": "banquet_table",
      "text": "两个人都不肯承担保管原件的风险。最后各留一份抄件，没有封条，也没有漂亮的程序。它们将更难被采信，却不再能被一只手全部拿走。"
    },
    {
      "choice": "add_test_clause",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": -1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "public_test",
      "items": "测试授权",
      "next": "machine_gate",
      "text": "主持人想把测试推到中标以后。你问，那现在出售的究竟是什么。沉默持续到莫小姐举起手。测试被写进程序，你也获得了进入机房的正式授权。"
    },
    {
      "choice": "add_test_clause",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "有限测试授权",
      "next": "machine_gate",
      "text": "测试只被列为“竞标人自愿展示”，费用与风险归你。晏律师把这一限制念了两遍，确保全场听见。你仍能下去，但不能指望规则替你兜底。"
    },
    {
      "choice": "question_proxy",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "proxy_on_record",
      "items": null,
      "next": "machine_gate",
      "text": "主持人给出了一个基金名称。你接着问受益人变更的时间，他终于停止翻页。晏律师申请将这一问答保留到最终表决，你争取到了一个不能轻易删去的缺口。"
    },
    {
      "choice": "question_proxy",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "refusal_recorded",
      "items": null,
      "next": "machine_gate",
      "text": "主持人用三层法律称谓把问题包了回去。晏律师没有替你遮掩，只申请记录“竞标人未获实质答复”。问题暂时失去了气势，却有了正式编号。"
    },
    {
      "choice": "secure_bridge",
      "result": "success",
      "capital": 3,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": "bridge_finance",
      "items": null,
      "next": "machine_gate",
      "text": "她同意先放款，条件是测试报告必须同时交给她。“我不是投资你的名声。”她收起笔，“我只是想知道明早有没有东西真的在工作。”"
    },
    {
      "choice": "secure_bridge",
      "result": "failure",
      "capital": 1,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "bridge_finance",
      "items": null,
      "next": "machine_gate",
      "text": "款项只到了一半，报告义务一字未减。你签下收据，意识到这种不对称正是她靠以谋生的本领。至少地下的工作不必等到资金问题完全解决。"
    },
    {
      "choice": "check_circuits",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": -1,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "safe_circuit",
      "items": null,
      "next": "machine_ledger",
      "text": "你们找到一处受潮的接点，先隔离，再上电。没有戏剧性的火花。乔工第一次把工具包留在你伸手可及的位置，仿佛你终于属于正在工作的人。"
    },
    {
      "choice": "check_circuits",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 2,
      "rel_counsel": null,
      "rel_engineer": -1,
      "rel_broker": null,
      "flags": null,
      "items": null,
      "next": "machine_ledger",
      "text": "保护开关跳了。你下意识去摸第二道闸，被乔工按住手腕。事故没有扩大，十几分钟却从钟上消失了。“先承认不知道。”他说，“这是技术的一部分。”"
    },
    {
      "choice": "organize_manual_shift",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "manual_watch",
      "items": null,
      "next": "machine_ledger",
      "text": "你没有替他解释设备，只确认每个人负责哪一盏灯、何时停止。两名值班员重新坐回工位。机器还没启动，房间已经不再像一处被弃置的资产。"
    },
    {
      "choice": "organize_manual_shift",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "manual_watch",
      "items": null,
      "next": "machine_ledger",
      "text": "你漏说了一道停止条件。乔工当众纠正，你照着重说，没有把尴尬藏进一句玩笑。值班员开始行动，信任来得比效率慢，但没有因此被赶出房间。"
    },
    {
      "choice": "use_maintenance_log",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "shutdown_not_failure",
      "items": null,
      "next": "machine_ledger",
      "text": "最后一份健康检查写着“通过”，下一份却直接变成了停机指令。中间缺少技术故障报告。你把两页并排放好，乔工说：“这就是我三个月来一直在解释的事。”"
    },
    {
      "choice": "use_maintenance_log",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": null,
      "next": "machine_ledger",
      "text": "记录的时间基准不同，你差点把正常延迟当成矛盾。乔工替你换算后，仍有一段空白没有消失。证据比你期待的窄，却足够支持继续检查。"
    },
    {
      "choice": "preserve_evidence",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 3,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "audit_ready",
      "items": "可核验总账",
      "next": "machine_bypass",
      "text": "你保留了不利于自己判断的几行备注，也标清无法确认的部分。晏律师因此愿意签下核验说明。两套总账不再只是一个令人愤怒的故事，而是一份别人可以逐项反驳的材料。"
    },
    {
      "choice": "preserve_evidence",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": null,
      "items": "有限核验总账",
      "next": "machine_bypass",
      "text": "有一笔转账无法对应到最终受益人。晏律师划掉了你准备写下的结论，留下事实本身。“少说这一句，其他几页才可能被人认真看完。”卷宗变薄了，仍然值得带走。"
    },
    {
      "choice": "preserve_evidence",
      "result": "criticalSuccess",
      "capital": null,
      "reputation": 1,
      "leverage": 4,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "audit_ready|independent_witnesses",
      "items": "可核验总账",
      "next": "machine_bypass",
      "text": "你在两套账里找到同一笔被重复标记的容量，并用外部交接记录锁定了时间。晏律师签署核验说明，乔工留下技术见证。总账终于有了两种独立的声音。"
    },
    {
      "choice": "map_open_access",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "open_blueprint",
      "items": "离线密钥",
      "next": "machine_bypass",
      "text": "你们划出一条不触碰商业预留容量的通路，足够诊所与港口救援先恢复联系。乔工把备用密钥交给你。“别把它叫奇迹。它每天都需要有人值班。”"
    },
    {
      "choice": "map_open_access",
      "result": "failure",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "limited_blueprint",
      "items": "紧急通道草图",
      "next": "machine_bypass",
      "text": "你想开放的容量与一段旧合同重叠。乔工删去那一段，只留下规模更小的紧急通道。你们没能给所有人一个承诺，但终于知道第一个承诺可以给谁。"
    },
    {
      "choice": "price_liabilities",
      "result": "success",
      "capital": 2,
      "reputation": null,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": "priced_liabilities",
      "items": null,
      "next": "machine_bypass",
      "text": "你把无法确认的债务单独列示，没有把它们藏进一行“其他”。莫小姐看完，把原本准备收回的一笔额度留在桌上。“这份坏消息，比那些好消息更像生意。”"
    },
    {
      "choice": "price_liabilities",
      "result": "failure",
      "capital": -1,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "liabilities_seen",
      "items": null,
      "next": "machine_bypass",
      "text": "储备金比你设想的高。你删掉了几项漂亮但无关紧要的承诺，预算仍然吃紧。莫小姐没有追加额度，却承认这是一份知道自己缺多少钱的报价。"
    },
    {
      "choice": "run_minimal_test",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": -1,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "working_demo",
      "items": null,
      "next": "council_witness",
      "text": "数据缓慢地走完进度条。远端没有欢呼，只回了一句“收到了”。乔工保存日志，你让所有人在成功时间旁签名。那一小行字，终于比宴厅里整夜的承诺更重。"
    },
    {
      "choice": "run_minimal_test",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "safe_rollback",
      "items": null,
      "next": "council_witness",
      "text": "数据在中途停住，自动回滚接管了通路。诊所先问原来的线路是否还在，你确认没有影响，才解释这次失败。乔工把回滚日志也装进报告：没有完成恢复，但你没有用别人的风险装饰自己的演示。"
    },
    {
      "choice": "demonstrate_evidence",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "control_demonstrated",
      "items": null,
      "next": "council_witness",
      "text": "撤回那条代理指令后，被标为“闲置”的容量立即出现了请求。你没有擅自接通，只保留全过程记录。晏律师说，今晚终于有一项说法可以同时拿给工程师和法官看。"
    },
    {
      "choice": "demonstrate_evidence",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "test_limitations",
      "items": null,
      "next": "council_witness",
      "text": "请求没有如期出现，因为旧缓存仍在生效。你把这一限制写进说明，没有剪去等待的部分。现场见证使材料更诚实，却暂时没能使它更有说服力。"
    },
    {
      "choice": "guarantee_maintenance",
      "result": "success",
      "capital": -2,
      "reputation": 2,
      "leverage": null,
      "pressure": -1,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": 1,
      "flags": "maintenance_funded",
      "items": null,
      "next": "council_witness",
      "text": "你先支付的是值守与备件，最后才是自己的展示。乔工确认收款后，把排班表接在测试报告后面。莫小姐抬头看了一眼，那是一份不会随着新闻稿撤走的成本。"
    },
    {
      "choice": "guarantee_maintenance",
      "result": "failure",
      "capital": -2,
      "reputation": 1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "partial_maintenance",
      "items": null,
      "next": "council_witness",
      "text": "供应商只肯确认最短的值守时段，担保不足以覆盖全部备件。你如实写出缺口，保留了一条先行维护安排。账面少了钱，但至少有人开始为下一班交接作准备。"
    },
    {
      "choice": "seat_counsel",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": -1,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "counsel_testified",
      "items": null,
      "next": "council_offer",
      "text": "晏律师先指出卷宗的两个限制，随后才解释已经能够确认的事实。有人露出意外神情。你没有打断，材料因此第一次像一种共同责任，而非个人声量。"
    },
    {
      "choice": "seat_counsel",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "counsel_limited",
      "items": null,
      "next": "council_offer",
      "text": "主持人只给她一句话的时间。她用那一句话确认材料来源，同时指出尚未解决的缺口。你原本准备好的开场被打乱，却得到了一份不能完全由你控制的支持。"
    },
    {
      "choice": "seat_counsel",
      "result": "criticalFailure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 2,
      "rel_counsel": -2,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "counsel_withdrew",
      "items": null,
      "next": "council_offer",
      "text": "理事会要求联合陈述人对竞标后的全部行为作保证。晏律师拒绝这项临时条件，交还发言证，却没有撤回已经核验的材料。“事实归事实，背书是另一回事。”她退出了你的陈述席，剩下的话要由你自己说完。"
    },
    {
      "choice": "show_test_log",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "technical_record_heard",
      "items": null,
      "next": "council_offer",
      "text": "你承认了测试的规模与边界，再让乔工回答一个尖锐的问题。桌边的人开始讨论具体的延迟、维护和责任。晨星终于从一个可任意想象的价格，变成一项需要认真处理的工作。"
    },
    {
      "choice": "show_test_log",
      "result": "failure",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "limits_disclosed",
      "items": null,
      "next": "council_offer",
      "text": "投影停在了一页不漂亮的错误记录上。你没有跳过，解释了它如何发生、怎样回滚。议员们没有完全信服，但至少无人能够说你只带来了一张成功截图。"
    },
    {
      "choice": "show_test_log",
      "result": "criticalFailure",
      "capital": null,
      "reputation": -1,
      "leverage": null,
      "pressure": 2,
      "rel_counsel": null,
      "rel_engineer": -2,
      "rel_broker": null,
      "flags": "engineer_withdrew",
      "items": null,
      "next": "council_offer",
      "text": "理事会要求乔工在“无条件保证持续运行”下面签名。他把报告留给书记员，收起工具包。“日志是真的。这个保证不是。”他返回机房处理值守，不再代表你的方案发言。你仍能提交文本，却必须承认技术支持已经少了一位。"
    },
    {
      "choice": "own_the_room",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": 1,
      "pressure": -1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "answered_questions",
      "items": null,
      "next": "council_offer",
      "text": "第一个问题针对动机，第二个问题针对钱。你没有要求他们相信你，只要求他们逐项核对附件。几轮质询之后，最先质疑的人把笔放下，开始听你的方案。"
    },
    {
      "choice": "own_the_room",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "correction_recorded",
      "items": null,
      "next": "council_offer",
      "text": "你在一处日期上答得太快，晏律师从后排提醒了正确时间。你当场更正，并请书记员保留更正记录。场面不再由你主导，但陈述没有因此变成谎言。"
    },
    {
      "choice": "protect_disclosure",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 2,
      "pressure": -1,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "independent_custody",
      "items": null,
      "next": "council_verdict",
      "text": "你把披露清单逐项念完，没有使用“全面”这种无从验收的词。主持人终于同意把原件交给独立保管方。清单与收据分别送达，今晚的资料第一次不再依附于你的座位。"
    },
    {
      "choice": "protect_disclosure",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "records_preserved",
      "items": null,
      "next": "council_verdict",
      "text": "他们只同意保全，不同意公开。你先确认保全期限，免得连这一点也在争论中消失。你得到一份仍不够好的承诺，也保住了继续争取的材料。"
    },
    {
      "choice": "protect_public_access",
      "result": "success",
      "capital": null,
      "reputation": 2,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "public_charter",
      "items": null,
      "next": "council_verdict",
      "text": "你为诊所、救援与值班工程师分别保留了具体位置，没有把他们写成一句“兼顾公共利益”。维护职责落实到条目，你也在资源协调一栏留下了自己的署名位。"
    },
    {
      "choice": "protect_public_access",
      "result": "failure",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "minimum_service",
      "items": null,
      "next": "council_verdict",
      "text": "席位没有争到，最小服务条款却留下了。你把其中的“酌情”划掉，递回桌前。主持人看着那道墨线，最后没有要求恢复原样。"
    },
    {
      "choice": "protect_control",
      "result": "success",
      "capital": 3,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": 1,
      "flags": "funded_offer",
      "items": null,
      "next": "council_verdict",
      "text": "你没有增加空泛的总价，而是调整付款顺序，让值守与备件先到账。莫小姐确认了额度，两个持票人重新计算了利益。控制权第一次有了一个可以落款的具体形状。"
    },
    {
      "choice": "protect_control",
      "result": "failure",
      "capital": -1,
      "reputation": null,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "restricted_offer",
      "items": null,
      "next": "council_verdict",
      "text": "你的资金条件没能换来全部表决权。对方递回一份附带限制的版本，莫小姐在旁边写下了限制的真实成本。你仍可以竞争，但已经无法假装代价只是一串数字。"
    },
    {
      "choice": "protect_control",
      "result": "criticalFailure",
      "capital": -2,
      "reputation": null,
      "leverage": null,
      "pressure": 2,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": -2,
      "flags": "broker_withdrew",
      "items": null,
      "next": "council_verdict",
      "text": "托管方临时追加的担保条件超出了莫小姐的授权。她划去尚未到账的额度，退出这轮资金安排。“已经确认的部分仍然有效，别把剩下的也写成事实。”你只能用手里真正存在的预算，完成最后一次选择。"
    },
    {
      "choice": "final_control",
      "result": "success",
      "capital": 1,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "intent_control",
      "items": null,
      "next": "END",
      "text": "你读出维护储备、历史责任与治理期限，再签名。已经确认的资金凭证被推到桌心，书记员开始逐一核票。决定已经进入程序；能否坐稳那把椅子，还要看你整夜留下了什么。"
    },
    {
      "choice": "final_control",
      "result": "failure",
      "capital": -1,
      "reputation": -1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "intent_control",
      "items": null,
      "next": "END",
      "text": "最后一轮质询暴露了报价里的薄处。你没有临时发明一笔钱，签下的是削去夸大承诺后的版本。它仍将进入核票，也可能只够换来一次退出的机会。"
    },
    {
      "choice": "final_open",
      "result": "success",
      "capital": null,
      "reputation": 1,
      "leverage": null,
      "pressure": null,
      "rel_counsel": null,
      "rel_engineer": 1,
      "rel_broker": null,
      "flags": "intent_open",
      "items": null,
      "next": "END",
      "text": "你把开放权限和停止权限一并写清，让每一个承诺都对应到维护岗位。章程连同值班安排被送去复核。文本交出去了，接下来它必须找到愿意共同承担的人，并经受日常工作的检验。"
    },
    {
      "choice": "final_open",
      "result": "failure",
      "capital": null,
      "reputation": -1,
      "leverage": null,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "intent_open",
      "items": null,
      "next": "END",
      "text": "一项资源保证没有得到确认，你当场缩小首批开放范围。书记员接收了这份有限方案，却没有替它宣布成功。它能否成立，取决于此前累积的信任是否足够。"
    },
    {
      "choice": "final_publish",
      "result": "success",
      "capital": null,
      "reputation": null,
      "leverage": 1,
      "pressure": null,
      "rel_counsel": 1,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "intent_publish",
      "items": null,
      "next": "END",
      "text": "你授权提交原始材料，也保留其中的不确定性。受理窗口在回执上写下时间。那不是对任何人的即时定罪，而是让一套原本只在关门后运转的安排，开始接受具体的提问。"
    },
    {
      "choice": "final_publish",
      "result": "failure",
      "capital": null,
      "reputation": null,
      "leverage": -1,
      "pressure": 1,
      "rel_counsel": null,
      "rel_engineer": null,
      "rel_broker": null,
      "flags": "intent_publish",
      "items": null,
      "next": "END",
      "text": "受理方要求补充一项证明。你没有把程序性退回包装成阴谋，而是将已被确认的部分先行封存。材料是否还能继续向前，取决于你有没有在今晚找到愿意共同署名的人。"
    }
  ],
  "raceLegs": [
    {
      "leg": 1,
      "id": "night-drive-1",
      "fromAct": 1,
      "toAct": 2,
      "title": "码头 → 玻璃宴厅"
    },
    {
      "leg": 2,
      "id": "night-drive-2",
      "fromAct": 2,
      "toAct": 3,
      "title": "宴厅 → 地下机房"
    },
    {
      "leg": 3,
      "id": "night-drive-3",
      "fromAct": 3,
      "toAct": 4,
      "title": "机房 → 黎明议会"
    }
  ],
  "raceTiers": [
    {
      "tier": "gold",
      "label": "金色回收",
      "absorbedMin": 20,
      "comboMin": 8,
      "logic": "and",
      "leverage": 2,
      "reputation": 1,
      "pressure": -1,
      "fate": 1,
      "itemPrefix": "金色车辙章·",
      "resultTitle": "这批零件，足够让营地换一副模样",
      "rewardText": "下一幕获得筹码、声誉、减压与一次改口。"
    },
    {
      "tier": "silver",
      "label": "银色回收",
      "absorbedMin": 9,
      "comboMin": 5,
      "logic": "or",
      "leverage": 1,
      "reputation": null,
      "pressure": -1,
      "fate": null,
      "itemPrefix": "合流车队徽·",
      "resultTitle": "车厢装满了，下一站仍在前方",
      "rewardText": "下一幕获得筹码，并降低一点压力。"
    },
    {
      "tier": "bronze",
      "label": "铜色回收",
      "absorbedMin": 0,
      "comboMin": 0,
      "logic": "or",
      "leverage": 1,
      "reputation": null,
      "pressure": null,
      "fate": null,
      "itemPrefix": "夜航通行印·",
      "resultTitle": "带着回收物，平安抵达",
      "rewardText": "抵达下一幕，获得一点筹码。"
    }
  ],
  "race": {
    "_说明": "夜航赛车：车辆基础性能、吸收成长、夜雾走廊、车流与评分",
    "track": {
      "lengthBase": 2100,
      "lengthPerAct": 120,
      "timeLimit": 100
    },
    "road": {
      "left": 230,
      "right": 730,
      "top": 0,
      "bottom": 540
    },
    "lanes": [
      280,
      380,
      480,
      580,
      680
    ],
    "base": {
      "speed": 148,
      "acceleration": 48,
      "handling": 230,
      "verticalSpeed": 195,
      "energy": 100
    },
    "growth": {
      "max": 8,
      "speed": 0.04,
      "acceleration": 0.055,
      "handling": 0.018
    },
    "speedCeilingMultiplier": 1.35,
    "boost": {
      "speedMultiplier": 1.24,
      "accelMultiplier": 1.3,
      "minEnergy": 1
    },
    "brakeDecel": 100,
    "precision": {
      "minOffset": 8,
      "energy": 8
    },
    "bumpImpulse": 105,
    "corridor": {
      "startDelay": 4,
      "phaseDuration": 7,
      "warningLead": 1.7,
      "baseHalfWidth": 96,
      "openHalfWidth": 250,
      "laneOrder": [
        0,
        3,
        1,
        4,
        2
      ],
      "actOffset": 3,
      "drainPerSecond": 9
    },
    "traffic": {
      "maxOnRoad": 12,
      "total": 240,
      "speedMin": 54,
      "speedJitter": 33,
      "laneChangeFirst": [
        2.8,
        2.2
      ],
      "laneChangeEvery": [
        3,
        2
      ],
      "colors": [
        "#c49261",
        "#709d99",
        "#a15c51",
        "#93a971",
        "#a495b5"
      ]
    },
    "score": {
      "progress": 1200,
      "absorbed": 82,
      "maxCombo": 31,
      "precisionHit": 68,
      "safeSecond": 4
    }
  },
  "resources": [
    {
      "id": "capital",
      "label": "资本",
      "uiLabel": "资本",
      "start": 8,
      "min": 0,
      "max": 40
    },
    {
      "id": "reputation",
      "label": "声望",
      "uiLabel": "声誉",
      "start": 1,
      "min": 0,
      "max": 12
    },
    {
      "id": "pressure",
      "label": "压力",
      "uiLabel": "压力",
      "start": 0,
      "min": 0,
      "max": 6
    },
    {
      "id": "leverage",
      "label": "筹码",
      "uiLabel": "筹码",
      "start": 0,
      "min": 0,
      "max": 12
    }
  ],
  "rules": {
    "defaultSeed": 123,
    "relationStart": 0,
    "relationRange": [
      -2,
      4
    ],
    "fateStart": 1,
    "fateRange": [
      0,
      5
    ],
    "crisisPressure": 6,
    "proficiency": {
      "base": 2,
      "levelsPerStep": 2
    },
    "xp": {
      "success": 3,
      "failure": 2,
      "criticalBonus": 1,
      "cap": 99
    },
    "levelThresholds": [
      7,
      15,
      24,
      34
    ],
    "criticalMultiplier": 1.5,
    "maxChecks": 24,
    "maxTraining": 3,
    "checksPerRun": 12,
    "dcRange": [
      1,
      40
    ],
    "modifierRange": [
      -10,
      10
    ]
  },
  "scenes": [
    {
      "id": "dock_invitation",
      "act": 1,
      "title": "没有署名的邀请",
      "kicker": "雨停在船舷之外",
      "speaker": null,
      "body1": "02:17。游艇停在自由港灯光照不到的那一侧。服务生送来一张没有署名的卡片：日出之前，夜间理事会将处置休眠轨道通信协议“晨星”的控制权。",
      "body2": "卡片背面印着一句小字：“迟到者仍可报价，但不得询问为何迟到。”孙哥把它翻回正面。岸上的接驳艇已经亮起了灯。"
    },
    {
      "id": "dock_counsel",
      "act": 1,
      "title": "句号以后的责任",
      "kicker": "晏律师在海关钟下等你",
      "speaker": "counsel",
      "body1": "晏律师递来一页文件。正面只有“顾问服务”，背面却规定：竞标人独自承担协议恢复后的全部历史责任。",
      "body2": "“他们把过去卖给你，把未来留给自己。”她把笔帽扣上，“我可以陪你进去，但你不能要求我把这句话说得好听。”"
    },
    {
      "id": "dock_manifest",
      "act": 1,
      "title": "被当作货物的人",
      "kicker": "同一辆车，两份清单",
      "speaker": null,
      "body1": "旧海关外，一辆货车正把宴会酒具和机房备用电源装在一起。乔工蹲在尾门边，不让搬运工把电池横放。",
      "body2": "莫小姐在车旁核对名单。“人从顶层进去，东西从地下一层进去。”她说，“今晚最值得知道的，是哪些人被写在了东西那一栏。”"
    },
    {
      "id": "banquet_foyer",
      "act": 2,
      "title": "两扇同样通向顶层的门",
      "kicker": "地毯吸走了鞋底的雨水",
      "speaker": null,
      "body1": "玻璃宴厅悬在港口上方，像一只并不打算落地的杯子。莫小姐站在迎宾台前，乔工推着工具车走向侧门。",
      "body2": "正门后的人愿意让你听到他们说的话。侧门后的人，知道这些话需要谁来收拾。你只有时间走其中一条路。"
    },
    {
      "id": "banquet_terrace",
      "act": 2,
      "title": "不喝酒的持票人",
      "kicker": "杯沿没有口红，也没有指纹",
      "speaker": "broker",
      "body1": "三位持票人围着一张小桌，谁也没有碰杯中的酒。每当谈到晨星的用户，他们就看向室内那把空着的主席椅。",
      "body2": "莫小姐低声说：“报价通常只有一个版本，忠诚有好几个。你最好弄清他们今晚带来了哪一版。”"
    },
    {
      "id": "banquet_service",
      "act": 2,
      "title": "服务电梯不说谎",
      "kicker": "这里的墙比宴厅更薄",
      "speaker": "engineer",
      "body1": "服务走廊堆着撤下来的花。门内的人正在感谢晨星“长期以来的稳定表现”，门外的乔工已经三个月没有收到维护预算。",
      "body2": "一台打印机吐出夜间指令：电力恢复申请必须由协议的“临时受益代表”核准。这个头衔不在宴会名单里。"
    },
    {
      "id": "banquet_table",
      "act": 2,
      "title": "空着的主席席",
      "kicker": "宴会最有权力的客人没有赴宴",
      "speaker": null,
      "body1": "空椅子旁只有一部静音电话。主持人宣布，竞标人必须在黎明提交“技术可行、责任明确、足额担保”的方案，三项缺一不可。",
      "body2": "莫小姐告诉你，所谓临时受益代表今晚不会出现。晏律师补了一句：“不出现，不等于没有安排。”乔工则看着钟。机房的备用电源撑不了太久。"
    },
    {
      "id": "machine_gate",
      "act": 3,
      "title": "海平面以下",
      "kicker": "最后一级台阶一直是湿的",
      "speaker": "engineer",
      "body1": "旧海关地下一层有自己的天气。潮气顺着电缆滴进集水槽，地面中继机柜上的指示灯稀疏得像一座被撤走住户的城市。",
      "body2": "乔工把手放在总闸旁：“晨星能不能重新工作，不由上面那些签字决定。可要是我们做错了，他们一定会找得到签字的人。”"
    },
    {
      "id": "machine_ledger",
      "act": 3,
      "title": "两套总账",
      "kicker": "同一段沉默被收费两次",
      "speaker": null,
      "body1": "主机保存着两套总账。一套说晨星没有足够用户，另一套按月向几家通信中介计收“保留容量”。容量始终留着，用户却被要求绕路。",
      "body2": "更刺眼的是受益人附录：那个代理席位既参与决定停机，也能从替代线路的涨价里分得收益。晏律师用指节压住纸边。“别急着替这件事起名字。先让它经得起提问。”"
    },
    {
      "id": "machine_bypass",
      "act": 3,
      "title": "临时电源",
      "kicker": "远端等来的第一个声音",
      "speaker": null,
      "body1": "天色开始把高窗染成灰白。乔工已经接好临时电源，只等一次可以写进报告的测试。",
      "body2": "屏幕上第一个等待接入的节点不是交易大厅，而是一间离岸诊所。对方发来很短的一句话：“能听见就请回答。”上面的人也在等你的回答，只是问题不同。"
    },
    {
      "id": "council_witness",
      "act": 4,
      "title": "证人坐在哪里",
      "kicker": "一张桌子的宽度",
      "speaker": null,
      "body1": "夜间理事会的房间比宴厅小得多。持票人已经落座，那部静音电话也被移到桌上，仍然没有人介绍它的主人。",
      "body2": "工作人员让顾问和技术人员坐在后排。孙哥停在椅子旁。你可以独自把今晚讲成一个完整故事，也可以允许那些不完全同意你的人，在故事里留下自己的声音。"
    },
    {
      "id": "council_offer",
      "act": 4,
      "title": "报价之外的条件",
      "kicker": "静音电话终于亮了一次",
      "speaker": "broker",
      "body1": "电话屏幕亮起。主持人看完信息，提出一个“提高效率”的安排：先授予控制权，再讨论公开范围；顾问与用户代表以后可以另行邀请。",
      "body2": "莫小姐把这段话抄在纸上推给你。“他们开始让步了。”她说，“现在的问题，是你会不会把最贵的部分，误认为赠品。”"
    },
    {
      "id": "council_verdict",
      "act": 4,
      "title": "表决前一分钟",
      "kicker": "天亮并不负责给出答案",
      "speaker": null,
      "body1": "港口第一班渡轮离开栈桥，窗外的玻璃由黑变灰。书记员把三份不同方向的文本放在你面前：取得控制，建立开放章程，或向外提交卷宗。",
      "body2": "你不能把三份都称为自己的本意。晏律师曾要你确认责任，乔工曾要你确认维护，莫小姐曾要你确认代价。此刻还能替你说话的人，已经不完全由你决定。孙哥拿起笔，没有人替他安排开场。"
    }
  ],
  "stats": [
    {
      "id": "rhetoric",
      "label": "辞令",
      "hint": "改变别人对问题的定义",
      "start": 2,
      "min": 0,
      "max": 8
    },
    {
      "id": "insight",
      "label": "洞察",
      "hint": "看见没有说出口的条件",
      "start": 2,
      "min": 0,
      "max": 8
    },
    {
      "id": "nerve",
      "label": "胆识",
      "hint": "承担不确定性并保持主动",
      "start": 2,
      "min": 0,
      "max": 8
    },
    {
      "id": "craft",
      "label": "技术",
      "hint": "理解系统真正如何运转",
      "start": 2,
      "min": 0,
      "max": 8
    }
  ],
  "vehicleModules": [
    {
      "id": "undecided",
      "title": "尚未装配",
      "speed": 1,
      "acceleration": 1,
      "handling": 1,
      "drain": 19,
      "regen": 4,
      "comboWindow": 2.7,
      "hitbox": 1,
      "zoneDrain": 1,
      "effect": null
    },
    {
      "id": "balanced",
      "title": "旧港标准件",
      "speed": 1,
      "acceleration": 1,
      "handling": 1,
      "drain": 19,
      "regen": 4,
      "comboWindow": 2.7,
      "hitbox": 1,
      "zoneDrain": 1,
      "effect": "旧港标准件，保持原有驾驶性能。"
    },
    {
      "id": "turbo",
      "title": "尖峰涡轮",
      "speed": 1.12,
      "acceleration": 1.08,
      "handling": 0.94,
      "drain": 27,
      "regen": 3,
      "comboWindow": 2.7,
      "hitbox": 1,
      "zoneDrain": 1.15,
      "effect": "极速 +12%，加速 +8%；转向略降，增压耗能更高。"
    },
    {
      "id": "magnet",
      "title": "磁吸保险杠",
      "speed": 0.96,
      "acceleration": 1,
      "handling": 1.08,
      "drain": 19,
      "regen": 4,
      "comboWindow": 3.8,
      "hitbox": 1.26,
      "zoneDrain": 0.9,
      "effect": "回收范围 +26%，连撞窗口延至 3.8 秒；极速 -4%。"
    },
    {
      "id": "reactor",
      "title": "稳态回充器",
      "speed": 1,
      "acceleration": 0.96,
      "handling": 1.12,
      "drain": 17,
      "regen": 7.5,
      "comboWindow": 3.1,
      "hitbox": 1.08,
      "zoneDrain": 0.45,
      "effect": "操控 +12%，自然回充 7.5/秒，夜雾额外耗能降低。"
    }
  ]
};

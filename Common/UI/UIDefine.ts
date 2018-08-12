//-------------------------------------------------------------------------------------------------
// UI相关的一些定义
// WHJ
//-------------------------------------------------------------------------------------------------

enum UIType
{
    UI_NULL                             = -1,
    UI_LOGIN                            = 0,            // 登陆界面
    UI_HALL                             = 1,            // 大厅
    UI_USERPACT                         = 2,            // 用户协议
    UI_PAOMADENG                        = 3,            // 跑马灯
    UI_SIGNINSUCCESS                    = 4,            // 签到成功
    UI_SIGNIN                           = 5,            // 签到
    UI_SHOPPROMPTING                    = 6,            // 商店道具提示
    UI_SHOP                             = 7,            // 商店
    UI_SETTING                          = 8,            // 设置界面
    UI_REWARD                           = 9,            // 奖励界面
    UI_PLAYERINFO                       = 10,           // 主玩家信息
    UI_NOTICE                           = 11,           // 公告
    UI_MESSAGE                          = 12,           // 提示
    UI_MATCH_TIMER                      = 13,           // 比赛倒计时
    UI_MATCH_RULE                       = 14,           // 比赛规则
    UI_MATCH_THISROUND_RANKING          = 15,           // 本轮比赛排名
    UI_MATCH_RANKING                    = 16,           // 比赛排名
    UI_MATCH_PROMOTION                  = 17,           // 比赛晋级
    UI_MATCH                            = 18,           // 比赛界面
    UI_MATCH_JUSHOWDOWN                 = 19,           // 比赛本局结算界面
    UI_MATCH_CONSUME                    = 20,           // 选择比赛消耗界面
    UI_CREATE_AND_JOIN                  = 21,           // 朋友场创建与加入界面
    UI_JOIN_ROOM                        = 22,           // 朋友场加入房间
    UI_CREATE_ROOM                      = 23,           // 朋友场创建房间
    UI_BATTLE_RECORD                    = 24,           // 战绩回放
    UI_BATTLE_DETAILED                  = 25,           // 详细战绩
    UI_MAIL                             = 26,           // 邮件
    UI_COLLECT_DIAMONDS                 = 27,           // 领钻界面
    UI_ABOUT_US                         = 28,           // 关于我们
    UI_BACK_PACK                        = 29,           // 背包
    UI_CHRYSANTHEMUM                    = 30,           // 菊花
}

class UIMisc
{
    public static UIParentName = "Canvas";          // UI父节点名
}

//大厅资源路径
class HallResPath
{
    public static PrefabPath = "Hall/Prefabs/"
	public static AltasPath = "Hall/Atlas/"
	public static SpinePath = "Hall/Spine/"
	public static AudioPath = "Hall/Audio/"
}

//面板路径
class UIPanelResDefine
{
    private UIRes = new Array();

    public constructor()
    {
        this.InitUIRes();
    }
    private InitUIRes()
    {
        this.UIRes[UIType.UI_LOGIN]                         = "LoginPanel";
        this.UIRes[UIType.UI_HALL]                          = "HallPanel";
        this.UIRes[UIType.UI_USERPACT]                      = "UserPatchPanel";
        this.UIRes[UIType.UI_PAOMADENG]                     = "UIPaoMaDengPanel";
        this.UIRes[UIType.UI_SIGNINSUCCESS]                 = "SignInSuccessPanel";
        this.UIRes[UIType.UI_SIGNIN]                        = "SignInPanel";
        this.UIRes[UIType.UI_SHOPPROMPTING]                 = "ShopPromptingPanel";
        this.UIRes[UIType.UI_SHOP]                          = "ShopPanel";
        this.UIRes[UIType.UI_SETTING]                       = "SettingPanel";
        this.UIRes[UIType.UI_REWARD]                        = "RewardPanel";
        this.UIRes[UIType.UI_PLAYERINFO]                    = "PlayerInfoPanel";
        this.UIRes[UIType.UI_NOTICE]                        = "NoticePanel";
        this.UIRes[UIType.UI_MESSAGE]                       = "MessagePanel";
        this.UIRes[UIType.UI_MATCH_TIMER]                   = "MatchTimerPanel";
        this.UIRes[UIType.UI_MATCH_RULE]                    = "MatchRulePanel";
        this.UIRes[UIType.UI_MATCH_THISROUND_RANKING]       = "MatchThisRoundRankingPanel";
        this.UIRes[UIType.UI_MATCH_RANKING]                 = "MatchRankingPanel";
        this.UIRes[UIType.UI_MATCH_PROMOTION]               = "MatchPromotionPanel";
        this.UIRes[UIType.UI_MATCH]                         = "MatchPanel";
        this.UIRes[UIType.UI_MATCH_JUSHOWDOWN]              = "MatchJuShowDownPanel";
        this.UIRes[UIType.UI_MATCH_CONSUME]                 = "MatchConsumePanel";
        this.UIRes[UIType.UI_CREATE_AND_JOIN]               = "CreateAndJoinPanel";
        this.UIRes[UIType.UI_JOIN_ROOM]                     = "JoinRoomPanel";
        this.UIRes[UIType.UI_CREATE_ROOM]                   = "CreateRoomPanel";
        this.UIRes[UIType.UI_BATTLE_RECORD]                 = "BattleRecordPanel";
        this.UIRes[UIType.UI_BATTLE_DETAILED]               = "BattleRecordDetailPanel";
        this.UIRes[UIType.UI_MAIL]                          = "MailPanel";
        this.UIRes[UIType.UI_COLLECT_DIAMONDS]              = "CollectDiamondsPanel";
        this.UIRes[UIType.UI_ABOUT_US]                      = "AboutUsPanel";
        this.UIRes[UIType.UI_BACK_PACK]                     = "BackPackPanel";
        this.UIRes[UIType.UI_CHRYSANTHEMUM]                 = "ChrysanthemumPanel";
    }

    public GetUIRes( ut : UIType )
    {
        if (this.UIRes[ut] == null)
        {
            cc.log("GetUIRes:" + ut.toString() + "== null");
            return "";
        }
        else
        {
            return this.UIRes[ut];
        }
    }
}

export { UIType, UIMisc, UIPanelResDefine, HallResPath }
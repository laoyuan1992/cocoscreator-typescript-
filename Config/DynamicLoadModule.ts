
export default class DynamicLoadModule  {
    public static DynamicLoadModuleType = 
    {
        LOAD_MODULE_NULL   : 0,
        LOAD_MATCH_MODULE  : 1,             //  比赛模块;
        LOAD_COMMON_MODULE : 2,            //  通用模块;
        LOAD_SHOP_MODULE   : 3,			   //  商店模块;
    }

    public static DynamicLoadMatchKind = 
{
    LOAD_DYNAMIC_NULL 			   : 0,
    LOAD_MATCH_ACTIVATION_CODEPOOL : 1,  // 加载比赛激活码;
    LOAD_MATCH_MATCHING_POOL       : 2,  // 加载排位赛匹配池;
    LOAD_MATCH_CONFIG              : 3,  // 加载比赛配置表;
    LOAD_COMMON_MATCH_CONFIG       : 4,  // 加载通用比赛配置表;
    LOAD_COMMON_REWARD_CONFIG      : 5,  // 加载通用奖励配置表;
    LOAD_COMMON_ITEM_CONFIG        : 6,  // 加载通用物品表;
    LOAD_COMMON_CONS_CONFIG        : 7,  // 加载通用消耗表;
    LOAD_MATCH_REWARD_CONFIG       : 8,  // 加载比赛奖励配置表;
	LOAD_MATCH_MASTER_SCORE_CONFIG : 9,  // 加载大师分发放表;
    LOAD_COMMON_SHOP_CONFIG        : 10, // 加载商店配置表;
    LOAD_COMMON_SHOPTYPE_CONFIG    : 11, // 加载商店类型配置表;
	LOAD_COMMON_PAOMADENG_CONFIG   : 12, // 加载跑马灯配置表;
	LOAD_COMMON_NOTICE_CONFIG      : 13, // 加载公告配置表;
	LOAD_COMMON_ROOM_CONFIG		   : 14, // 加载房间配置表;
    LOAD_MATCH_TAG_CONFIG          : 15, // 加载比赛标签；
}
}
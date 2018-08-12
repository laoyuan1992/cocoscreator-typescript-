import GameDefine from "./GameDefine";

//-------------------------------------------------------------------------------------------------
// 聊天表情 
//-------------------------------------------------------------------------------------------------

export default class ChatDefines
{
        public static UIChatConfig = {
        1   : { Name : "辛苦"	, Path : GameDefine.SpinePath + "Chat/lengjing"    , Image : "lengjing"   , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mxinku"      ,AudioWoman : "pk_wxinku"        , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        2   : { Name : "和我斗"	, Path : GameDefine.SpinePath + "Chat/caofeng"     , Image : "caofeng"    , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mhewodou"    ,AudioWoman : "pk_whewodou"      , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        3   : { Name : "不要吵"	, Path : GameDefine.SpinePath + "Chat/sikao"       , Image : "sikao"      , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mbuyaochao"  ,AudioWoman : "pk_wbuyaochao"    , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        4   : { Name : "打得好"	, Path : GameDefine.SpinePath + "Chat/kuazan"      , Image : "kuazan"     , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mdadehao"    ,AudioWoman : "pk_wdadehao"      , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        5   : { Name : "报单"	, Path : GameDefine.SpinePath + "Chat/meipai"      , Image : "meipai"     , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_msheng1"     ,AudioWoman : "pk_wsheng1"       , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        6   : { Name : "剩两张"	, Path : GameDefine.SpinePath + "Chat/paihao"      , Image : "paihao"     , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_msheng2"     ,AudioWoman : "pk_wsheng2"       , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        7   : { Name : "不要走"	, Path : GameDefine.SpinePath + "Chat/huaji"       , Image : "huaji"      , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mbuyaozou"   ,AudioWoman : "pk_wbuyaozou"     , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        8   : { Name : "约"	    , Path : GameDefine.SpinePath + "Chat/yueju"       , Image : "yueju"      , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_myue"        ,AudioWoman : "pk_wyue"          , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        9   : { Name : "催促"	, Path : GameDefine.SpinePath + "Chat/chuichu"     , Image : "chuichu"    , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mkuai"       ,AudioWoman : "pk_wkuai"         , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
        10  : { Name : "手气好"	, Path : GameDefine.SpinePath + "Chat/shouqihao"   , Image : "shouqihao"  , Atlas : GameDefine.AtlasPath + "face" , AudioMan : "pk_mshouqihao"  ,AudioWoman : "pk_wshouqihao"    , Prefab : GameDefine.PrefabPath + "ChatItemCell"  },
    };
}
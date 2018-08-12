import Singleton from "../../Common/Function/Singleton";
import NetManager from "../../Common/Net/NetManager";


class GameDefine extends Singleton
{
    private readonly PrefabPath             = "GD_XJ/Prefabs/";
    private readonly AudioPath              = "GD_XJ/Audio/Effects/";
    private readonly AtlasPath              = "GD_XJ/Atlas/";
    private readonly SpinePath              = "GD_XJ/Spine/";
    private readonly BackGroundAudioPath    = "Audio/Backgrounds/"
    public readonly  RoomType               = "GD_XJ";
    public readonly  GameUIConfig =
    {
        UI_GAME                 : { type : 201 , path :this.PrefabPath + "GuanDanPanel"                   }, // 游戏界面
        UI_SHOWDOWN      		: { type : 202 , path :this.PrefabPath + "GDShowDownPanel"                }, // 升级小结算界面
        UI_PRIVATESHOWDOWN      : { type : 203 , path :this.PrefabPath + "GDPrivateShowDownPanel"         }, // 大结算
        UI_ROOMRECORD		    : { type : 204 , path :this.PrefabPath + "GDPrivateRoomRecordPanel"       }, // 发起解散界面
        UI_DISSOLVEROOM			: { type : 205 , path :this.PrefabPath + "GDDissolveRoomPanel"            }, // 房间内战绩（确定解散界面）
        UI_RULE					: { type : 206 , path :this.PrefabPath + "GDRulePanel"                    }, // 规则
        UI_GAMESETTING			: { type : 207 , path :this.PrefabPath + "GameSettingPanel"               }, // 设置
        UI_GAMEPLAYERINFO		: { type : 208 , path :this.PrefabPath + "GamePlayerPanel"                }, // 个人信息
        UI_IM					: { type : 209 , path :this.PrefabPath + "IMPanel"                        }, // 语音
        UI_CHAT					: { type : 210 , path :this.PrefabPath + "UIChatPanel"                    }, // 聊天
        UI_RECORDGAME           : { type : 211 , path :this.PrefabPath + "GuanDanRecordPanel"             }, // 回放主界面
        UI_RECORDSHOWDOWN       : { type : 212 , path :this.PrefabPath + "GDRecordShowDownPanel"          }, // 回放结算界面
        UI_GAMESHARE			: { type : 213 , path :this.PrefabPath + "GDGameSharePanel"               }, // 分享
        UI_SHOWDOWNSCORE        : { type : 214 , path :this.PrefabPath + "GDShowDownScorePanel"           }, // 分数小结算界面
        UI_RECORDSHOWDOWNSCORE  : { type : 215 , path :this.PrefabPath + "GDRecordShowDownScorePanel"     }, // 回放分数结算界面
    }
    //麻将规则
    public readonly Descript ="一.规则：\n1.掼蛋使用两副牌，共108张。玩家分成两队，共4人。\n2.级牌，一开始均从2开始，哪一队获胜，则该队升级，并且下一把牌使用该队级牌。\n二.牌型：牌点由大到小排列为：大王、小王、A、K、Q、J、10、9、8、7、6、5、4、3、2。\n1.单张：任意一张单牌。\n2.顺子：任意五张点数相连的牌。下家出的顺子必须和上家顺子牌数一样。\n3.对子：任意两张点数相同的牌。\n4.三同张：三张点数相同的牌。\n5.木板：三对点数相连的对子。\n6.三带二：点数相同的三张牌+对子，下家只能更高点数的三张牌压，只比三张的点数大小，不比带的牌。\n7.钢板：点数相连的2个3同张。\n8.炸弹：4张相同点数为炸弹，牌相同时点数越高越大。炸弹可以压下其他牌型。\n9.同花顺：相同花色，5张点数相连的牌。可以管5张及5张以下的炸弹，不能管5张以上的炸弹。\n10.火箭：2张大王和2张小王，最大的牌，可以管任意牌。\n三.分数计算：\n1.团团转：\n 团团转每把只打2，打完一副牌后换一次队友。\n 第一个打完所有牌的玩家所在队伍获胜，根据获胜队2人名次情况加减分数。\n 上游+二游 +30分\n 上游+三游 +20分\n 上游+末游 +10分\n获胜队伍加多少分，失败队伍减去相应分数。\n2.经典玩法：\n 每次打完升级，升级倍数可选择。打完一局时可以交换一次队友。玩家可选择每把牌打完是否进贡。\n 第一个打完所有牌的玩家所在队伍获胜，根据获胜队2人名次情况升级。\n上游+二游 升4级\n 上游+三游 升2级\n 上游+末游 升1级\n 当一个队伍3把没有打过A或打过A时，该局结束，根据双方等级计算分数。";
    //花色掩码
    public readonly MaskColor = 0xF0;
    //数值掩码
    public readonly MaskValue = 0x0F;
    //最大深度
    public readonly MaxDepth = 100;
    //初始级别
    public readonly InitSeries = 0x22;
    //掼蛋牌型类型俺码
    public readonly GDCardTypeMask = 0xFF;
    //掼蛋手牌拉伸距离
    public readonly GDStretchDis  = 10;
    //掼蛋主玩家手牌一列中各个牌的间隙
    public readonly BottomCardGap = 35;
    //掼蛋手牌拉伸时间
    public readonly GDStretchTime = 0.2;
    //主玩家手牌宽度
    public readonly BottomCardWidth = 110;
    //主玩家手牌高度
    public readonly BottomCardHeight = 140;
    //中心提示时间
    public readonly CenterHitTime = 30;
    //进还贡时间
    public readonly CenterGiftTime = 20;

    //座位
    public readonly GameSeats =
    {
        1:"BOTTOM",
        2:"RIGHT",
        3:"TOP",
        4:"LEFT"
    }

    //方向
    public readonly GameDir =
    {
        1:"mj_icon_east",
        2:"mj_icon_south",
        3:"mj_icon_west",
        4:"mj_icon_north"
    }

    // 点选方式
    public readonly GDSelectCardWay =
    {
        SCW_ERROR	: -1 ,		// 无
        SCW_SINGLE	: 0,		// 单张
        SCW_COLUMN	: 1,		// 整列
    };

    //显示互动道具
    public readonly InteractItem : Array<number> = [5001005,5001006,5001007,5001008];

    //获取显示的级别
    public GetShowLevel( Level :number ) : string
    {
        if ( Level == 1 )
        {
            return "A";
        }else if ( Level >= 2 && Level <= 10 )
        {
            return Level.toString();
        }else if ( Level == 11 )
        {
            return "J";
        }else if ( Level == 12 )
        {
            return "Q";
        }else if ( Level == 13 )
        {
            return "K";
        }else if ( Level == 14 )
        {
            return "A";
        }else
        {
            return "2";
        }
    }

    //获取牌值
    public GetCardValue( CardData :number ) : number
    {
        return CardData & this.MaskValue;
    }

    //获取颜色
    public GetCardColor( CardData :number ) : number
    {
        return CardData & this.MaskColor;
    }

    // X排列方式
    public readonly XCollocateMode =
    {
        XLeft   : 0,
        XCenter : 1,
        XRight  : 2
    }

    //Y排列方式
    public readonly YCollocateMode =
    {
        YTop   : 0,
        YCenter : 1,
        YBottom  : 2
    }

    //点选方式
    public SelectCardWay =
    {
        SCW_ERROR   : -1, //无
        SCW_SINGLE  : 0,  //单张
        SCW_COLUMN  : 1   //整列
    }

    //掼蛋牌的图片配置(0方块 ,16梅花 , 32红桃 , 48黑桃 , 64王 )
    private CardImageConfig =
    {
        0 : 
        {
             1  : { color_path : "fp", value_path :"01",   center_path : "fpp" },
             2  : { color_path : "fp", value_path :"02",   center_path : "fpp" },
             3  : { color_path : "fp", value_path :"03",   center_path : "fpp" },
             4  : { color_path : "fp", value_path :"04",   center_path : "fpp" },
             5  : { color_path : "fp", value_path :"05",   center_path : "fpp" },
             6  : { color_path : "fp", value_path :"06",   center_path : "fpp" },
             7  : { color_path : "fp", value_path :"07",   center_path : "fpp" },
             8  : { color_path : "fp", value_path :"08",   center_path : "fpp" },
             9  : { color_path : "fp", value_path :"09",   center_path : "fpp" },
             10 : { color_path : "fp", value_path :"010",  center_path : "fpp" },
             11 : { color_path : "fp", value_path :"011",  center_path : "fpp" },
             12 : { color_path : "fp", value_path :"012",  center_path : "fpp" },
             13 : { color_path : "fp", value_path :"013",  center_path : "fpp" },
        },

        16 : 
        {
             1  : { color_path : "ch", value_path :"11",   center_path : "chp" },
             2  : { color_path : "ch", value_path :"12",   center_path : "chp" },
             3  : { color_path : "ch", value_path :"13",   center_path : "chp" },
             4  : { color_path : "ch", value_path :"14",   center_path : "chp" },
             5  : { color_path : "ch", value_path :"15",   center_path : "chp" },
             6  : { color_path : "ch", value_path :"16",   center_path : "chp" },
             7  : { color_path : "ch", value_path :"17",   center_path : "chp" },
             8  : { color_path : "ch", value_path :"18",   center_path : "chp" },
             9  : { color_path : "ch", value_path :"19",   center_path : "chp" },
             10 : { color_path : "ch", value_path :"110",  center_path : "chp" },
             11 : { color_path : "ch", value_path :"111",  center_path : "chp" },
             12 : { color_path : "ch", value_path :"112",  center_path : "chp" },
             13 : { color_path : "ch", value_path :"113",  center_path : "chp" },
        },

        32 : 
        {
             1  : { color_path : "hx", value_path :"01",   center_path : "hxp" },
             2  : { color_path : "hx", value_path :"02",   center_path : "hxp" },
             3  : { color_path : "hx", value_path :"03",   center_path : "hxp" },
             4  : { color_path : "hx", value_path :"04",   center_path : "hxp" },
             5  : { color_path : "hx", value_path :"05",   center_path : "hxp" },
             6  : { color_path : "hx", value_path :"06",   center_path : "hxp" },
             7  : { color_path : "hx", value_path :"07",   center_path : "hxp" },
             8  : { color_path : "hx", value_path :"08",   center_path : "hxp" },
             9  : { color_path : "hx", value_path :"09",   center_path : "hxp" },
             10 : { color_path : "hx", value_path :"010",  center_path : "hxp" },
             11 : { color_path : "hx", value_path :"011",  center_path : "hxp" },
             12 : { color_path : "hx", value_path :"012",  center_path : "hxp" },
             13 : { color_path : "hx", value_path :"013",  center_path : "hxp" },
        },

        48 : 
        {
             1  : { color_path : "ht", value_path :"11",   center_path : "htp" },
             2  : { color_path : "ht", value_path :"12",   center_path : "htp" },
             3  : { color_path : "ht", value_path :"13",   center_path : "htp" },
             4  : { color_path : "ht", value_path :"14",   center_path : "htp" },
             5  : { color_path : "ht", value_path :"15",   center_path : "htp" },
             6  : { color_path : "ht", value_path :"16",   center_path : "htp" },
             7  : { color_path : "ht", value_path :"17",   center_path : "htp" },
             8  : { color_path : "ht", value_path :"18",   center_path : "htp" },
             9  : { color_path : "ht", value_path :"19",   center_path : "htp" },
             10 : { color_path : "ht", value_path :"110",  center_path : "htp" },
             11 : { color_path : "ht", value_path :"111",  center_path : "htp" },
             12 : { color_path : "ht", value_path :"112",  center_path : "htp" },
             13 : { color_path : "ht", value_path :"113",  center_path : "htp" },
        },
        64 :
        {
            1  : { color_path : "kong", value_path :"xwm",   center_path : "xw" },
            2  : { color_path : "kong", value_path :"dwm",   center_path : "dw" },
        }
    }

    //单张音效
    public SingleCardAudioName =
    {
        1  : { man : "gdms1"  , woman : "gdws1"  },
        2  : { man : "gdms2"  , woman : "gdws2"  },
        3  : { man : "gdms3"  , woman : "gdws3"  },
        4  : { man : "gdms4"  , woman : "gdws4"  },
        5  : { man : "gdms5"  , woman : "gdws5"  },
        6  : { man : "gdms6"  , woman : "gdws6"  },
        7  : { man : "gdms7"  , woman : "gdws7"  },
        8  : { man : "gdms8"  , woman : "gdws8"  },
        9  : { man : "gdms9"  , woman : "gdws9"  },
        10 : { man : "gdms10" , woman : "gdws10" },
        11 : { man : "gdms11" , woman : "gdws11" },
        12 : { man : "gdms12" , woman : "gdws12" },
        13 : { man : "gdms13" , woman : "gdws13" },
        14 : { man : "gdmsxw" , woman : "gdwsxw" },
        15 : { man : "gdmsdw" , woman : "gdwsdw" },
    }

    //两张音效
    public DoubleCardAudioName =
    {
        1  : { man : "gdmp1"  , woman : "gdwp1"  },
        2  : { man : "gdmp2"  , woman : "gdwp2"  },
        3  : { man : "gdmp3"  , woman : "gdwp3"  },
        4  : { man : "gdmp4"  , woman : "gdwp4"  },
        5  : { man : "gdmp5"  , woman : "gdwp5"  },
        6  : { man : "gdmp6"  , woman : "gdwp6"  },
        7  : { man : "gdmp7"  , woman : "gdwp7"  },
        8  : { man : "gdmp8"  , woman : "gdwp8"  },
        9  : { man : "gdmp9"  , woman : "gdwp9"  },
        10 : { man : "gdmp10" , woman : "gdwp10" },
        11 : { man : "gdmp11" , woman : "gdwp11" },
        12 : { man : "gdmp12" , woman : "gdwp12" },
        13 : { man : "gdmp13" , woman : "gdwp13" },
        14 : { man : "gdmpxw" , woman : "gdwpxw" },
        15 : { man : "gdmpdw" , woman : "gdwpdw" },
    }

    //三张及以上音效
    public ThreeCardAudioName =
    {
        sanzhang     : { man : "gdm3zhang"      , woman : "gdw3zhang"       },
        sandaier     : { man : "gdm3dai2"       , woman : "gdw3dai2"        },
        muban        : { man : "gdmmuban"       , woman : "gdwmuban"        },
        shunzi       : { man : "gdmshunzi"      , woman : "gdwshunzi"       },
        gangban      : { man : "gdmgangban"     , woman : "gdwgangban"      },
        tonghuashun  : { man : "gdmtonghuashun" , woman : "gdwtonghuashun"  },
        zhadan       : { man : "gdmzhadan"      , woman : "gdwzhadan"       },
        wangzha      : { man : "gdmwangzha"     , woman : "gdwwangzha"      },
    }

    //游戏内音效
    public LiPinFeiXing  = "lipinfeixing";
    public YouXiKaiShi	 = "youxikaishi";
    public JinRuFangJian = "jinrufangjian";
    public GDWGuo 		 = "gdwguo";
    public GDMGuo		 = "gdmguo";

    //根据颜色和值获取一个配置表
    public GetCardImageConfig( Color : number , Value : number ) : any 
    {
        let Config = this.CardImageConfig[Color.toString()];
        if ( null == Config ){ return; }
        return Config[Value.toString()];
    }

    // 获取右上角的牌小图
    public GetSmallCardImage( Color : number , Value : number ) : string 
    {
        let Config = this.GetCardImageConfig( Color , Value );
        if ( null == Config ){ return ""; }
        return Config.color_path;
    }

    // 获取中间的牌大图
    public GetBigCardImage( Color : number , Value : number ) : string 
    {
        let Config = this.GetCardImageConfig( Color , Value );
        if ( null == Config ){ return ""; }
        return Config.center_path;
    }

    // 获取牌值图
    public GetCardNumImage( Color : number , Value : number ) : string 
    {
        let Config = this.GetCardImageConfig( Color , Value );
        if ( null == Config ){ return ""; }
        return Config.value_path;
    }

    //获取牌初始化位置
    public GetCardVector2( Key : number ) : cc.Vec2
    {
        let Vector2 : cc.Vec2 = null;
        switch (Key) {
            case 1:
                Vector2 = new  cc.Vec2( 580 ,53 );
                break;
            case 2:
                Vector2 = new  cc.Vec2( 0 ,285 );
                break;
            case 3:
                Vector2 = new  cc.Vec2( -580 ,53 );
                break;
            case 4:
                Vector2 = new  cc.Vec2( -100 ,80 );
                break;
            case 5:
                Vector2 = new  cc.Vec2( 100 ,80 );
                break;
            default:
                Vector2 = new cc.Vec2(0,0);
                break;
        }
        return Vector2;
    }

    //获取名称对应的图标名
    public GetRankImageName( Rank : number ) : string
    {
        let str ="";
        switch (Rank) {
            case 1:
                str = "shangyou";
                break;
            case 2:
                str = "eryou";
                break;
             case 3:
                str = "sanyou";
                break;
            case 4:
                str = "xiayou";
                break;
        
            default:
                break;
        }
        return str;
    }
    //获取普通牌型音效地址
    public GetCardAudioPath(  CardValue : number, Man : boolean , CardScle : number ) : string
    {
        if ( 1 == CardScle )
        {
            for (const key in this.SingleCardAudioName) {
                if (this.SingleCardAudioName.hasOwnProperty(key)) 
                {
                    const element = this.SingleCardAudioName[key];
                    if ( parseInt(key) == CardValue )
                    {
                        if ( Man )
                        {
                            return element["man"];
                        }
                        else
                        {
                            return element["woman"];
                        }
                    }
                }
            }
        }
        
        if ( 2 == CardScle )
        {
            for (const key in this.DoubleCardAudioName) {
                if (this.DoubleCardAudioName.hasOwnProperty(key)) 
                {
                    const element = this.DoubleCardAudioName[key];
                    if ( parseInt(key) == CardValue )
                    {
                        if ( Man )
                        {
                            return element["man"];
                        }
                        else
                        {
                            return element["woman"];
                        }
                    }
                }
            }
        }
    }

    // 获取特殊牌型音效地址
    public GetSpecialCardAudioPath( Kind : number, Man : boolean )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let GuanDanCT = ProtoBuf.TGuanDanCT;
        if ( Kind == GuanDanCT.CT_THREE_TIAO )
        {
            return Man ? this.ThreeCardAudioName.sanzhang.man : this.ThreeCardAudioName.sanzhang.woman;
        }else if ( Kind == GuanDanCT.CT_HU_LU )
        {
            return Man ? this.ThreeCardAudioName.sandaier.man : this.ThreeCardAudioName.sandaier.woman;
        } 
        else if ( Kind == GuanDanCT.CT_LIANG_LIAN_DUI )
        {
            return Man ? this.ThreeCardAudioName.muban.man : this.ThreeCardAudioName.muban.woman;
        } 
        else if ( Kind == GuanDanCT.CT_SHUN_ZI )
        {
            return Man ? this.ThreeCardAudioName.shunzi.man : this.ThreeCardAudioName.shunzi.woman;
        } 
        else if ( Kind == GuanDanCT.CT_GANG_BAN )
        {
            return Man ? this.ThreeCardAudioName.gangban.man : this.ThreeCardAudioName.gangban.woman;
        } 
        else if ( Kind == GuanDanCT.CT_TONG_HUA_SHUN )
        {
            return Man ? this.ThreeCardAudioName.tonghuashun.man : this.ThreeCardAudioName.tonghuashun.woman;
        } 
        else if ( Kind == GuanDanCT.CT_SI_ZHANG_BOMB || Kind == GuanDanCT.CT_WU_ZHANG_BOMB || Kind == GuanDanCT.CT_LIU_ZHANG_BOMB || Kind == GuanDanCT.CT_QI_ZHANG_BOMB || Kind == GuanDanCT.CT_BA_ZHANG_BOMB || Kind == GuanDanCT.CT_JIU_ZHANG_BOMB || Kind == GuanDanCT.CT_SHI_ZHANG_BOMB  )
        {
            return Man ? this.ThreeCardAudioName.zhadan.man : this.ThreeCardAudioName.zhadan.woman;
        } 
        else if ( Kind == GuanDanCT.CT_FOUR_KING )
        {
            return Man ? this.ThreeCardAudioName.wangzha.man : this.ThreeCardAudioName.wangzha.woman;
        }
    }
}

export default GameDefine.GetInstance();
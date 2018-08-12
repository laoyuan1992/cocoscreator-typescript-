import LinkedList from "../../Common/DataStruct/LinkedList";
import GameDefine from "../Module/GameDefine";
import NetManager from "../../Common/Net/NetManager";
import ResourcesManager from "../../Framework/ResourcesManager";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import Util from "../../Utility/Util";
import GamePlayer from "../Module/GamePlayer";
import UIManager from "../../Common/UI/UIManager";
import UIBase from "../../Common/UI/UIBase";
import StringHelper from "../../Utility/StringHelper";
import RoomCostConfig from "../../Config/RoomCostConfig";
import RecordGuanDanNode from "../Module/RecordGuanDanNode";
import AppFacade from "../../Framework/AppFacade";
import SceneManager from "../../Scene/SceneManager";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRecordToolsList extends UIBase
{

    @property(cc.Label)
    TextFangJianHao: cc.Label          = null; // 房间号
    @property(cc.Sprite)
    ImageXinHao: cc.Sprite             = null; // 信号
    @property(cc.Label)
    TextTimer: cc.Label                = null; // 当前时间
    @property(cc.Sprite)
    ImageDianLiangBG : cc.Sprite       = null; // 电量bg
    @property(cc.Sprite)
    ImageDianLiang : cc.Sprite         = null; // 电量
    @property(cc.Label)
    TextGameType: cc.Label             = null; // 游戏名字
    @property(cc.Label)
    TextGuiZe: cc.Label                = null; // 规则
    @property(cc.Label)
    TextAllGameNumber: cc.Label        = null; // 游戏总把数
    @property(cc.Sprite)
    ImageMineFlag : cc.Sprite          = null; 
    @property(cc.Sprite)
    ImageOtherFlag : cc.Sprite         = null; 
    @property(cc.Label)
    TextMyLevel: cc.Label              = null;
    @property(cc.Label)
    TextOtherLevel: cc.Label           = null;
    @property(cc.Label)
    TextMineYellow: cc.Label           = null;
    @property(cc.Label)
    TextMineBlue: cc.Label             = null;
    @property(cc.Label)
    TextOtherYellow: cc.Label          = null;
    @property(cc.Label)
    TextOtherBlue: cc.Label            = null;
    @property(cc.Sprite)
    ImageMineTeam: cc.Sprite           = null;
    @property(cc.Sprite)
    ImageOtherTeam: cc.Sprite          = null;
    @property(cc.Sprite)
    imageKuaiJin: cc.Sprite            = null; 
    @property(cc.Sprite)
    imageShowDown: cc.Sprite           = null; 
    @property(cc.Sprite)
    imagePlay: cc.Sprite               = null; 
    @property(cc.Sprite)
    imageReturn: cc.Sprite             = null;
    @property(cc.Sprite)
    imageReturnHall: cc.Sprite             = null;

    private mStartPosition : cc.Vec2   = new cc.Vec2( 407 , -48 );
    private mEndPosition   : cc.Vec2   = new cc.Vec2( 5   , -48 );
    private mDragDownState : boolean   = true;
    private mTHSList       : LinkedList= new LinkedList();  //同花顺列表
    private THSIdx         : number    = 1;      //当前同花顺索引

    private mCurShowTshColor: number= -1;		// 当前显示的同花顺颜色类型
    private mCurShowTshIdx  : number = 0;	
    private mTimeTimer = null;
    private mIsRecordOver = false;
    private mIsPlaying = true;
    onLoad () {}

    start () 
    {
        this.InitBatteryComponent();
        this.InitTimeComponent();
        this.InitWlanComponent();
    }
    onDestroy()
    {
       this.StopTimer();
    }

    private StopTimer()
    {
        if ( this.mTimeTimer != null ) 
            this.unschedule( this.mTimeTimer );
        if ( this.RefreshWlanComponent != null ) 
            this.unschedule( this.RefreshWlanComponent );
    }
    // 电量
    private InitBatteryComponent()
    {
        
    }
    // 时间
    private InitTimeComponent()
    {
        this.RefreshTimeComponent();
        if ( this.mTimeTimer != null ) 
            this.unschedule( this.RefreshTimeComponent );
        this.mTimeTimer = this.RefreshTimeComponent.bind(this);
        this.schedule(this.mTimeTimer,60);
    }

    // 刷新时间
    private RefreshTimeComponent()
    {
        let date = new Date();
        let h = StringHelper.PadLeft( date.getHours().toString() , 2 , "0" ) ;
        let m = StringHelper.PadLeft( date.getMinutes().toString() , 2 , "0" ) ; 
        this.TextTimer.string = h + ":"+m;
    }
    // 信号
    private InitWlanComponent()
    {
        if ( this.RefreshWlanComponent != null ) 
            this.unschedule( this.RefreshWlanComponent );
        this.RefreshWlanComponent = this.RefreshWlanComponent.bind(this);
        this.schedule(this.RefreshWlanComponent,10);
    }

    // 刷新信号
    private RefreshWlanComponent()
    {

    }
  
    //点击邀请按钮
    public OnClickWeChatFriend()
    {
        this.PlayButtonAudio();
        if( window["wx"] != undefined )
        {
            window["wx"].shareAppMessage({
                title:    '快来玩呀',
                imageUrl: "https://wegame.webtest.zhiwa-game.com/wechat-game-res/GuanDan/Texture/icon108.png",
                query:    "RoomNumber=" + RecordGuanDanScenes.Instance.CurrRoomID.toString(),
              })
        }
    }

    // 刷新玩法;
    public RefershWanFa()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let WanFa = "";
        WanFa += RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) ? "经典玩法" : "团团转玩法 每把都打2";
        let UpGrade = "";
        if(RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
        {
            WanFa += RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_GIFT) ? "  进贡" : "  不进贡";
            WanFa += RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW) ? "  固定座位" : "  随机座位";
           if(RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J))
           {
                UpGrade = "  双下升3级";
           }
           else if(RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J))
           {
                UpGrade = "  双下升4级";
           }
           else
           {
                UpGrade = "  双下升4级";
           }
           WanFa += UpGrade;
           let DoubleNums = "";
           if(RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_FB))
            {
                DoubleNums = "  不翻倍";
            }
            else if(RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_2FB))
            {
                DoubleNums = "  翻2倍";
            }
            else if(RecordGuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_3FB))
            {
                DoubleNums = "  翻3倍";
            }
            else
            {
                DoubleNums = "  不翻倍";
            }
            WanFa += DoubleNums;
        }
        let PayMode = "";
        let PM  = RecordGuanDanScenes.Instance.CurPayMode;
        if(PM == ProtoBuf.TPaymentMechanism.BIG_OWNER_OPTION)
        {
            PayMode = "  大赢家付费";
        }
        else if(PM == ProtoBuf.TPaymentMechanism.AA_SYSTEM_OPTION)
        {
            PayMode = "  AA制付费";
        }
        else if(PM == ProtoBuf.TPaymentMechanism.ROOM_OWNER_OPTION)
        {
            PayMode = "  房主付费";
        }
        WanFa +=PayMode;
        this.TextGuiZe.string = WanFa;
        this.InitGameType();
    }

    //初始化GameType
    private InitGameType()
    {
       // this.TextGameType.string = "掼蛋";
    }

    //
    public RecordOverStopPlay()
    {
        this.mIsRecordOver  = true;
        this.mIsPlaying     = false;
        this.imageKuaiJin.spriteFrame   = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_kuaijinweixuan" );
        this.imagePlay.spriteFrame      = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_zantingweixuan" );
    }

    //点击返回按钮
    public OnClickReturnHall()
    {
        this.PlayButtonAudio();
        RecordGuanDanNode.OnRelease();
        AppFacade.Instance.GetSoundManager().StopGameBackGroundMusic();
        SceneManager.LoadScene( "Hall" );
    }

    //快进
    public OnClickKuaiJin()
    {   
        this.PlayButtonAudio();
        if(this.mIsRecordOver || ! this.mIsPlaying) return;
        this.imageKuaiJin.spriteFrame   = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_kuaijin" );
        this.imagePlay.spriteFrame      = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_zantingweixuan" );
        RecordGuanDanNode.RecordPlaySpeed();
    }

    //播放Or暂停
    public OnClickPlayOrStop()
    {
        this.PlayButtonAudio();
        if( this.mIsRecordOver ) return;
        let IsPlay = RecordGuanDanNode. RecordPlayOrStop();
        if( IsPlay )
        {
            this.mIsPlaying = true;
            this.imagePlay.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_zanting" );
        }
        else
        {
            this.mIsPlaying = false;
            this.imagePlay.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_bofang" );
        }
        this.imageKuaiJin.spriteFrame  = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "Record" , "btn_kuaijinweixuan" );
    }

    //返回
    public OnClickReturn()
    {
        this.PlayButtonAudio();
        RecordGuanDanNode.RePlayRecord();
    }

    //结算
    public OnClickOpenShowDown()
    {
        this.PlayButtonAudio();
        RecordGuanDanNode.GetRecordShowDownInfo();
    }


    //刷新房间号
    public RefreshRoomNumber( State : boolean )
    {
        if ( State )
        {
            let RoomNumberStr : string = RecordGuanDanScenes.Instance.CurrRoomID.toString()
            RoomNumberStr = StringHelper.PadLeft(RoomNumberStr,6,"0")
            this.TextFangJianHao.string = RoomNumberStr;
        }else
        {
            this.TextFangJianHao.node.active = false;
        }
    }



    //初始化游戏级别
    public InitGameLevel()
    {
        let LevelMin = 0;
        let LevelOther = 0;
        let playerList : LinkedList = RecordGuanDanScenes.Instance.PlayerList;
        for ( let i = 1; i <= playerList.GetCount(); i++ )
        {
            let Player : GamePlayer = playerList.Get(i);
            if ( Util.Equal64Num(  Player.GetPID(), PlayerDataModule.GetPID() ) )
            {
                LevelMin = Player.GetSeries();
                break;
            }
        }

        for ( let i = 1; i <= playerList.GetCount(); i++ )
        {
            let Player : GamePlayer = playerList.Get(i);
            if ( LevelMin != Player.GetSeries()  )
            {
                LevelOther = Player.GetSeries();
                break;
            }
        }

        if ( 0 == LevelOther ) { LevelOther = LevelMin; }
        this.ShowGameLevel( LevelMin,LevelOther, RecordGuanDanScenes.Instance.CurSeries );
    }
   
    //显示游戏级别
    public ShowGameLevel( Mine : number, Other : number, MainSeries : number )
    {
        let mine_Level  = Mine & GameDefine.MaskValue;
        let other_Level = Other & GameDefine.MaskValue;
        let mine_Level_Str = GameDefine.GetShowLevel(mine_Level);
        let other_Level_Str = GameDefine.GetShowLevel(other_Level);
        this.TextMyLevel.string = mine_Level_Str;
        this.TextOtherLevel.string = other_Level_Str;
        if ( Mine == Other )
        {
            this.ImageMineFlag.node.active  = true;
            this.ImageOtherFlag.node.active = true;
        }else
        {
            let State = Mine == MainSeries;
            this.ImageMineFlag.node.active = State;
            this.ImageOtherFlag.node.active = !State;
        }
    } 

    //刷新游戏把数
    public RefreshGameCount()
    {
        if( null == this.TextAllGameNumber ) return;
        let Count = RoomCostConfig.GetGameCount(RecordGuanDanScenes.Instance.GuanDanRoomData.cost_id)   
        let ProtoBuf = NetManager.GetProtobuf();
        if( RecordGuanDanScenes.Instance.CheckSpecial( ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) )
        {
            this.TextAllGameNumber.string = "打过A"
        }
        else
        {
            this.TextAllGameNumber.string = ( RecordGuanDanScenes.Instance.CurrGameCount + 1 ) + "/" + Count + "把";
        }
    }
   
    //刷新队伍显示(左上角)
    public RefreshTeamIcon( Team : number )
    {
        this.TextMineYellow.node.active = false;
        this.TextMineBlue.node.active = false;
        this.TextOtherYellow.node.active = false;
        this.TextOtherBlue.node.active = false;
        if ( 1 == Team )
        {
            this.ImageMineTeam.spriteFrame =  ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , "bg_table_pk_y" );
            this.ImageOtherTeam.spriteFrame =  ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , "bg_table_pk_b" );
            this.TextMineYellow.node.active = true;
            this.TextOtherBlue.node.active = true;
        }else if ( 2 == Team )
        {
            this.ImageMineTeam.spriteFrame =  ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , "bg_table_pk_b" );
            this.ImageOtherTeam.spriteFrame =  ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , "bg_table_pk_y" );
            this.TextMineBlue.node.active = true;
            this.TextOtherYellow.node.active = true;
        }
    }

    //刷新房间信息
    public RefreshRoomInfo()
    {
        this.RefershWanFa();
    }
}

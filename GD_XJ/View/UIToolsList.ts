import LinkedList from "../../Common/DataStruct/LinkedList";
import GuanDanScenes from "../Module/GuanDanScenes";
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

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIToolsList extends UIBase
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
    TextGameNumber: cc.Label           = null; // 游戏把数
    @property(cc.Label)
    TextReady: cc.Label                = null; // 准备字样
    @property(cc.Label)
    TextScore: cc.Label                = null; // 分数
    @property(cc.Label)
    TextGuiZe: cc.Label                = null; // 规则
    @property(cc.Label)
    TextAllGameNumber: cc.Label        = null; // 游戏总把数
    @property(cc.Node)
    Remind: cc.Node                    = null; // 返回按钮
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
    @property(cc.Node)
    ToolsDown: cc.Node                 = null; 
    @property(cc.Node)
    FuncBtnObj: cc.Node                = null; 
    @property(cc.Node)
    BtnLookDesk: cc.Node                = null;
    @property(cc.Button)
    BtnBlackTsh: cc.Button             = null;  //黑桃同花顺按钮
    @property(cc.Sprite)
    ImgBlackTsh: cc.Sprite             = null;  //黑桃同花顺遮罩
    @property(cc.Button)
    BtnRedTsh: cc.Button               = null;  //红心同花顺按钮
    @property(cc.Sprite)
    ImgRedTsh: cc.Sprite               = null;  //红心同花顺遮罩
    @property(cc.Button)
    BtnPlumTsh: cc.Button              = null;  //梅花同花顺按钮
    @property(cc.Sprite)
    ImgPlumTsh: cc.Sprite              = null;  //梅花同花顺遮罩
    @property(cc.Button)
    BtnDiamondTsh: cc.Button           = null;  //方块同花顺按钮
    @property(cc.Sprite)
    ImgDiamondTsh: cc.Sprite           = null;  //方块同花顺遮罩
    @property(cc.Button)
    ButtonInvateWeChat: cc.Button      = null;  //邀请微信好友
    @property(cc.Button)
    ButtonReady: cc.Button             = null;  //点击准备
    @property(cc.Button)
    ButtonDragDown: cc.Button          = null;  //弹框
    @property(cc.Button)
    ButtonReturn: cc.Button            = null;  //返回大厅按钮
    @property(cc.Button)
    ButtonBox: cc.Button               = null;  //返回大厅按钮
    @property(cc.Button)
    ButtonSendGift: cc.Button          = null;  //进贡按钮
    @property(cc.Button)
    ButtonRepayGift: cc.Button         = null;  //还贡按钮
    @property(cc.Node)
    BGIMage: cc.Node                   = null;  //空白处


    private mStartPosition : cc.Vec2   = new cc.Vec2( 407 , -48 );
    private mEndPosition   : cc.Vec2   = new cc.Vec2( 5   , -48 );
    private mDragDownState : boolean   = true;
    private mTHSList       : LinkedList= new LinkedList();  //同花顺列表
    private THSIdx         : number    = 1;      //当前同花顺索引

    private mCurShowTshColor: number   = -1;		// 当前显示的同花顺颜色类型
    private mCurShowTshIdx  : number   = 0;	
    private mTimeTimer                 = null;      //时钟计时器
    private mBatteryAndWlanTimer       = null;      //电量和信号计时器

    start () 
    {
        this.BGIMage.on(cc.Node.EventType.TOUCH_END,  this.OnClickBG  , this );
        this.InitBatteryAndWlanComponent();
        this.InitTimeComponent();
        this.RefreshButtonSendGift( false );
        this.RefreshButtonRepayGift( false );
        this.BtnLookDesk.on( cc.Node.EventType.TOUCH_START  , this.OnObserveDeskDown , this );
        this.BtnLookDesk.on( cc.Node.EventType.TOUCH_END    , this.OnObserveDeskUp   , this );
        this.BtnLookDesk.on( cc.Node.EventType.TOUCH_CANCEL , this.OnObserveDeskUp   , this );
    }

    onDestroy()
    {
        this.StopTimer();
        this.BGIMage.off(cc.Node.EventType.TOUCH_END,  this.OnClickBG  , this );
        this.BtnLookDesk.off( cc.Node.EventType.TOUCH_START   , this.OnObserveDeskDown , this );
        this.BtnLookDesk.off( cc.Node.EventType.TOUCH_END     , this.OnObserveDeskUp   , this );
        this.BtnLookDesk.off( cc.Node.EventType.TOUCH_CANCEL  , this.OnObserveDeskUp   , this );
    }

    private StopTimer()
    {
        if ( this.mTimeTimer != null ) 
            this.unschedule( this.mTimeTimer );
        if ( this.mBatteryAndWlanTimer != null ) 
            this.unschedule( this.mBatteryAndWlanTimer );
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

     // 初始化电量和信号
     private InitBatteryAndWlanComponent()
    {
        if( window["wx"] == undefined ) return;    
        this.RefreshBatteryAndWlanComponent()
            if ( this.mBatteryAndWlanTimer != null ) 
            this.unschedule( this.RefreshBatteryAndWlanComponent );
        this.mBatteryAndWlanTimer = this.RefreshBatteryAndWlanComponent.bind(this);
        this.schedule(this.mBatteryAndWlanTimer,10);
    }

    // 刷新电量和信号
    private RefreshBatteryAndWlanComponent()
    {
        window["wx"].getSystemInfoSync({
            success: (res) => {
                this.RefreshBatteryComponent(res.battery);
                this.RefreshWlanComponent(res.wifiSignal);
            }
        })
    }

    //刷新电量
    private RefreshBatteryComponent( Value : number )
    {
        if( Value <= 0)
        {
            this.ImageDianLiangBG.node.color =  cc.color( 255 , 255 , 255 , 0);
            return;
        }
        let Num = Value / 100;
        if( Num < 0.2 )
        {
            this.ImageDianLiang.node.color =  cc.color( 255 , 0 , 0 , 215 );
        }
        else
        {
            this.ImageDianLiang.node.color = cc.color( 255 , 255 , 255 , 255 );
        }
        this.ImageDianLiang.fillRange = Num;
        this.ImageDianLiangBG.node.color =  cc.color( 255 , 255 , 255 , 255);
    }

    //刷新信号
    private RefreshWlanComponent( value : number)
    {
        if( value >= 3 )
        {
            value = 1;
        }
        else if( value > 1 )
        {
            value = 2;
        }
        else
        {
            value = 3;
        }
        this.ImageXinHao.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , "icon_xinhao" + value );

    }

    //刷新进贡按钮显示
    public RefreshButtonSendGift( State : boolean )
    {
        this.ButtonSendGift.node.active = State;
    }
    //刷新还贡按钮显示
    public RefreshButtonRepayGift( State : boolean )
    {
        this.ButtonRepayGift.node.active = State;
    }
    //隐藏所有的同花顺按钮功能
    public HideTshBtns()
    {
        this.BtnBlackTsh.interactable = false;
        this.BtnRedTsh.interactable = false;
        this.BtnPlumTsh.interactable = false;
        this.BtnDiamondTsh.interactable = false;
        this.ImgBlackTsh.node.active = true;
        this.ImgRedTsh.node.active = true;
        this.ImgPlumTsh.node.active = true;
        this.ImgDiamondTsh.node.active = true;
        this.mCurShowTshColor = -1;					// 当前显示的同花顺颜色类型
        this.mCurShowTshIdx = 0;					
    }
    //刷新返回大厅按钮状态
    public RefreshBackBtnSate( State )
    {
        this.ButtonReturn.node.active = State;
        this.Remind.active = !State;
    }
    //点击邀请按钮
    public OnClickWeChatFriend()
    {
        this.PlayButtonAudio();
        if( window["wx"] != undefined )
        {
            window["wx"].shareAppMessage({
                title:    "快来玩呀",
                imageUrl: "https://wegame.webtest.zhiwa-game.com/wechat-game-res/GuanDan/Texture/icon108.png",
                query:    "InvitaRoomNum=" + GuanDanScenes.Instance.CurrRoomID.toString(),
              })
        }
    }

    //点击准备按钮
    public OnClickReadyGame()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SendUserReady();
    }

    //点击解散按钮
    public OnClickJieSan()
    {
        this.PlayButtonAudio();
        this.OnClickDragDown();
        GuanDanScenes.Instance.SendRequestRelieveRoom( true );
    }

    //点击返回大厅
    public OnClickReturn()
    {
        this.PlayButtonAudio();
        NetManager.SendMessage( "GD_RRM" );
    }

    //点击录音按钮
    public OnClickBeginSound()
    {
       
    }

    //点击空白处
    private OnClickBG()
    {
        cc.systemEvent.emit("GD_CLEARCARDSELECT");
    }

    //点击停止录音按钮
    public OnClickEndSound()
    {
       
    }

    //点击帮助按钮
    public OnClickBangZhu()
    {
        this.PlayButtonAudio();
        this.OnClickDragDown();
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_RULE )
    }

    //点击聊天按钮
    public OnClickChat()
    {
        this.PlayButtonAudio();
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_CHAT )
    }

    //点击设置按钮
    public OnClickSetting()
    {
        this.PlayButtonAudio();
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_GAMESETTING );
        this.OnClickDragDown();
    }

    //点击奖杯按钮
    public OnClickJiangBei()
    {
        this.PlayButtonAudio();
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_ROOMRECORD );
        this.OnClickDragDown();
    }

    //点击菜单按钮
    public OnClickDragDown()
    {
        this.PlayButtonAudio();
        let Image = this.ButtonDragDown.node.getComponent(cc.Sprite);
        if ( this.mDragDownState )
        {
            this.mDragDownState = false;
            Image.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" ,"icon_shouqi" );
            let Moveto = cc.moveTo( 0.3, this.mEndPosition );
            this.ToolsDown.stopAllActions();            
            this.ToolsDown.runAction(Moveto);
            this.ButtonBox.node.active = true;
        }
        else
        {
            this.mDragDownState = true;
            Image.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" ,"icon_open" );
            let Moveto = cc.moveTo( 0.3, this.mStartPosition );
            this.ToolsDown.stopAllActions();
            this.ToolsDown.runAction(Moveto);
            this.ButtonBox.node.active = false;
        }
    }

    // 刷新玩法;
    public RefershWanFa()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let WanFa = "";
        WanFa += GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) ? "经典玩法" : "团团转玩法 每把都打2";
        let UpGrade = "";
        if(GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF))
        {
            WanFa += GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_GIFT) ? "  进贡" : "  不进贡";
        WanFa += GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_GDZW) ? "  固定座位" : "  随机座位";
           if(GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_DL3J))
           {
                UpGrade = "  双下升3级";
           }
           else if(GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_DL4J))
           {
                UpGrade = "  双下升4级";
           }
           else
           {
                UpGrade = "  双下升4级";
           }
           WanFa += UpGrade;
           let DoubleNums = "";
           if(GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_FB))
            {
                DoubleNums = "  不翻倍";
            }
            else if(GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_2FB))
            {
                DoubleNums = "  翻2倍";
            }
            else if(GuanDanScenes.Instance.CheckSpecial(ProtoBuf.TGameGuanDanSpecial.TGDSK_3FB))
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
        let PM  = GuanDanScenes.Instance.CurPayMode;
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
        let RoomNumberStr : string = GuanDanScenes.Instance.CurrRoomID.toString()
        RoomNumberStr = StringHelper.PadLeft(RoomNumberStr,6,"0")
        this.TextGameNumber.string = RoomNumberStr;
        this.InitGameType();
    }

    //初始化GameType
    private InitGameType()
    {
        //this.TextGameType.string = "掼蛋";
    }

    //刷新私人房间按钮
    public RefreshSpecialButton( State : boolean )
    {
        this.ButtonInvateWeChat.node.active = State;
        this.ButtonReady.node.active = State;
        this.TextFangJianHao.node.active = State;
    }

    //设置准备按钮可见状态
    public ShowReadyButton( State : boolean )
    {
        this.ButtonReady.node.active = State;
    }
    
    //设置邀请好友按钮可见状态
    public ShowInviteButton( State : boolean )
    {
        this.ButtonInvateWeChat.node.active = State;
    }

    //刷新房间号
    public RefreshRoomNumber( State : boolean )
    {
        if ( State )
        {
            let RoomNumberStr : string = GuanDanScenes.Instance.CurrRoomID.toString()
            RoomNumberStr = StringHelper.PadLeft(RoomNumberStr,6,"0")
            this.TextFangJianHao.string = RoomNumberStr;
        }else
        {
            this.TextFangJianHao.node.active = false;
        }
    }

    //刷新房间按钮
    public RefreshButtonReady( State : boolean )
    {
        this.ButtonReady.interactable = State;
        this.TextReady.string = State ? " 准    备" : "已 准 备";
    }

    //模拟GUI刷新准备
    public SimulateGUIButtonReady()
    {
        let MainPlayer = GuanDanScenes.Instance.GetRolePlayer( PlayerDataModule.GetPID() );
        if (null == MainPlayer) return;
        this.RefreshButtonReady( !MainPlayer.IsReady() );
    }

    //重置Toolslist面板
    public ResetToolsList()
    {
        if ( GuanDanScenes.Instance.IsStartGame() ) return;
        this.RefreshSpecialButton( true );
		this.RefreshRoomNumber( true );
    }

    //刷新功能按钮显示
    public RefreshFuncBtns( State : boolean )
    {
        //如果主玩家没手牌了，直接隐藏掉
        if ( GuanDanScenes.Instance.GetMainPlayerCardNums() == 0 ){ State = false; } 
        this.FuncBtnObj.active = State;
    }
        
    //初始化游戏级别
    public InitGameLevel()
    {
        let LevelMin = 0;
        let LevelOther = 0;
        let playerList : LinkedList = GuanDanScenes.Instance.PlayerList;
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
        this.ShowGameLevel( LevelMin,LevelOther, GuanDanScenes.Instance.CurSeries );
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
        let Count = RoomCostConfig.GetGameCount(GuanDanScenes.Instance.GuanDanRoomData.cost_id)   
        let ProtoBuf = NetManager.GetProtobuf();
        if( GuanDanScenes.Instance.CheckSpecial( ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) )
        {
            this.TextAllGameNumber.string = "打过A"
        }
        else
        {
            this.TextAllGameNumber.string = ( GuanDanScenes.Instance.CurrGameCount + 1 ) + "/" + Count + "把";
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
            this.ImageOtherTeam.spriteFrame =  ResourcesManager.LoadSprite(GameDefine.AtlasPath + "GuanDan" , "bg_table_pk_y" );
            this.TextMineBlue.node.active = true;
            this.TextOtherYellow.node.active = true;
        }
    }

    //点击进贡按钮
    public OnClickSendGift()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SendUserSendGift();
    }

    //点击还贡按钮
    public OnClickRepayGift( event )
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.SendUserRecvGift();
    }
   
    //点击观察桌面
    public OnObserveDeskDown( event )
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit("GD_RH_VS" , false );
    }

    //观察桌面按钮抬起
    public OnObserveDeskUp()
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit("GD_RH_VS" , true );
    }

    //点击整成一列
    public OnClickMakeColumn()
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit("GD_MAKE_COLUMN");
    }
    
    //点击同花顺
    public OnClickTSH()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.GuanDanGamePromptOpti.GetTSHSimple();
        let PromptTSHList = GuanDanScenes.Instance.GuanDanGamePromptOpti.GetPromptList();
        if ( PromptTSHList.GetCount() > 0 )
        {
            if ( this.THSIdx > PromptTSHList.GetCount() ) { this.THSIdx = 1; }
            let TSH = PromptTSHList.Get( this.THSIdx );
            this.THSIdx += 1;
            cc.systemEvent.emit("GD_SH_TSH" , TSH );
        }
    }

    //点击重新整理
    public OnClickRefreshColumn()
    {
        this.PlayButtonAudio();
        cc.systemEvent.emit("GD_CLENA_UP" );
    }

    //点击推荐选牌
    public OnClickRecomMake()
    {
    }

    //点击黑桃同花顺
    public OnClickBlackTsh()
    {
        this.PlayButtonAudio();
        if ( this.mCurShowTshColor != 0x30 )
        {
            this.mCurShowTshColor = 0x30;
            this.mCurShowTshIdx   = 0;
        }
        let PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
        this.mCurShowTshIdx = PromptData.i;
        if( 0 == PromptData.i )
        {
            PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
            this.mCurShowTshIdx = PromptData.i;
        }
        if ( PromptData == null ) return;
        cc.systemEvent.emit("GD_SH_TSH" , PromptData.PromptCardInfo );
    }

    //点击红桃同花顺
    public OnClickRedTsh()
    {
        this.PlayButtonAudio();
        if ( this.mCurShowTshColor != 0x20 )
        {
            this.mCurShowTshColor = 0x20;
            this.mCurShowTshIdx   = 0;
        }
        let PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
        this.mCurShowTshIdx = PromptData.i;
        if( 0 == PromptData.i )
        {
            PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
            this.mCurShowTshIdx = PromptData.i;
        }
        if ( PromptData == null ) return;
        cc.systemEvent.emit("GD_SH_TSH" , PromptData.PromptCardInfo );
    }

    //点击梅花同花顺
    public OnClickPlumTsh()
    {
        this.PlayButtonAudio();
        if ( this.mCurShowTshColor != 0x10 )
        {
            this.mCurShowTshColor = 0x10;
            this.mCurShowTshIdx   = 0;
        }
        let PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
        this.mCurShowTshIdx = PromptData.i;
        if( 0 == PromptData.i )
        {
            PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
            this.mCurShowTshIdx = PromptData.i;
        }
        if ( PromptData == null ) return;
        cc.systemEvent.emit("GD_SH_TSH" , PromptData.PromptCardInfo );
    }

    //点击方块同花顺
    public OnClickDiamondTsh()
    {
        this.PlayButtonAudio();
        if ( this.mCurShowTshColor != 0x0 )
        {
            this.mCurShowTshColor = 0x0;
            this.mCurShowTshIdx   = 0;
        }
        let PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
        this.mCurShowTshIdx = PromptData.i;
        if( 0 == PromptData.i )
        {
            PromptData = this.GetTsh( this.mCurShowTshColor , this.mCurShowTshIdx );
            this.mCurShowTshIdx = PromptData.i;
        }
        if ( PromptData == null ) return;
        cc.systemEvent.emit("GD_SH_TSH" , PromptData.PromptCardInfo );
    }

    //获取一个花色，大于某个索引的同花顺
    public GetTsh( Color : number , Idx : number )
    {
        GuanDanScenes.Instance.GuanDanGamePromptOpti.GetTSHSimple();
        let PromptTSHList = GuanDanScenes.Instance.GuanDanGamePromptOpti.GetPromptList();
        for ( let i = 1; i <= PromptTSHList.GetCount(); i++ )
        {
            let PromptCardInfo = PromptTSHList.Get(i);
            let TshColor = this.GetTshColor(PromptCardInfo);
            if (Color == TshColor && i > Idx) 
            {
                return { PromptCardInfo, i};
            }
        }
        return {PromptCardInfo : null , i : 0 }  ;
    }

    //刷新同花顺按钮显示
    public RefreshTshBtn()
    {
        this.HideTshBtns();
        GuanDanScenes.Instance.GuanDanGamePromptOpti.GetTSHSimple();
        let PromptTSHList = GuanDanScenes.Instance.GuanDanGamePromptOpti.GetPromptList();
        for ( let i = 1; i <= PromptTSHList.GetCount(); i++ )
        {
            let PromptCardInfo = PromptTSHList.Get(i);
            let Color = this.GetTshColor(PromptCardInfo); 
            if ( Color == 0x0 )                         //方块
            {
                this.BtnDiamondTsh.interactable = true;
                this.ImgDiamondTsh.node.active = false;
            }else if ( Color == 0x10 )                  //梅花
            {
                this.BtnPlumTsh.interactable = true;
                this.ImgPlumTsh.node.active = false;
            }
            else if ( Color == 0x20 )                   //红桃
            {
                this.BtnRedTsh.interactable = true;
                this.ImgRedTsh.node.active = false;
            }
            else if ( Color == 0x30 )                   //黑桃
            {
                this.BtnBlackTsh.interactable = true;
                this.ImgBlackTsh.node.active = false;
            }
        } 
           
    }

     //获取一个同花顺的提示的花色
    public GetTshColor( PromptCardInfo ) : number
    {
        if ( PromptCardInfo == null ) return -1;
        let ProtoBuf = NetManager.GetProtobuf();
        if ( PromptCardInfo.KindType  != ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN )  return -1;
        for ( let i = 1; i <= PromptCardInfo.CardValueList.GetCount(); i++ )
        {
            let CV = PromptCardInfo.CardValueList.Get(i);
            if ( CV == null ) continue;
            if ( CV != GuanDanScenes.Instance.CurSeries )
            {
                return GameDefine.GetCardColor( CV );
            } 
        }
        return -1;
    }

    //刷新房间信息
    public RefreshRoomInfo()
    {
        this.RefreshGameCount();
        this.RefershWanFa();
    }
}

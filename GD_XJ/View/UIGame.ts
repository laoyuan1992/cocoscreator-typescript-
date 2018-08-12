import EventName from "../../Common/Event/EventName";
import GamePlayer from "../Module/GamePlayer";
import GuanDanScenes from "../Module/GuanDanScenes";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import UIToolsList from "./UIToolsList";
import UISeatsBase from "./UISeatsBase";
import UISeatsBottom from "./UISeatsBottom";
import UISeatsRight from "./UISeatsRight";
import UISeatsTop from "./UISeatsTop";
import UISeatsLeft from "./UISeatsLeft";
import GameDefine from "../Module/GameDefine";
import LinkedList from "../../Common/DataStruct/LinkedList";
import { GuanDanGamePromptOpti } from "../Module/GuanDanGamePromptOpti";
import NetManager from "../../Common/Net/NetManager";
import AppFacade from "../../Framework/AppFacade";
import Util from "../../Utility/Util";
import { Message } from "../../Common/Net/Message";
import GameCard from "../Module/GameCard";
import GDCardUIPanel from "./GDCardUIPanel";
import UICenterHint from "./UICenterHint";
import UIBase from "../../Common/UI/UIBase";
import ResourcesManager from "../../Framework/ResourcesManager";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UIGame extends UIBase
{
    @property( UIToolsList )
    UIToolsList : UIToolsList = null; 

    @property( UISeatsBottom )
    BottomSeat : UISeatsBottom = null; 

    @property( UISeatsRight )
    RightSeat : UISeatsRight  = null; 

    @property( UISeatsTop )
    TopSeat : UISeatsTop    = null; 

    @property( UISeatsLeft )
    LeftSeat : UISeatsLeft   = null; 

    @property( cc.Node )
    EffectParent : cc.Node   = null; 
    
    @property( cc.Node )
    GiftCardParent : cc.Node  = null; 

    @property( UICenterHint )
    CenterHint : UICenterHint  = null; 

    @property(cc.Node)
    CardOptionObj : cc.Node = null;        // 权限组件

    @property(cc.Button)
    BtnPass: cc.Button = null;              //过牌按钮

    @property(cc.Button)
    BtnOut: cc.Button = null;               //出牌按钮

    @property(cc.Button)
    BtnPrompt: cc.Button = null;            //提示按钮

    @property(GDCardUIPanel)
    GiftCardList: GDCardUIPanel[] = [];

    private mPromptIdx       :  number   = 1;
    private mFreePromptIdx   :  number   = -1;//自由出牌的索引

    private mSeatsList       : LinkedList = new LinkedList();

    onLoad () 
    {
    }

    start () 
    {
        this.InitGUI();
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_HEAD           , this.NotifiRefreshHead               , this);//重置界面
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_NAME           , this.NotifiRefreshName               , this);//重置界面        
        cc.systemEvent.on("GD_RT_DA"                , this.NotifiResetGUI               , this);//重置界面
        cc.systemEvent.on("GD_SIMUL"                , this.NotifiSimulateGUI            , this);//模拟GUI
        cc.systemEvent.on("GD_BD_SS"                , this.NotifiBindSeats              , this);//座位
        cc.systemEvent.on("GD_ST_CE"                , this.NotifiSelectChoice           , this);//刷新权限
        cc.systemEvent.on("GD_GR_GL"                , this.NotifiGameLevel              , this);//刷新游戏级别
        cc.systemEvent.on("GD_GD_SE"                , this.NotifiScore                  , this);//刷新分数
        cc.systemEvent.on("GD_GD_TE"                , this.NotifiTeam                   , this);//刷新队伍
        cc.systemEvent.on("GD_SI_GN"                , this.NotifiDrawGiftCard           , this);//模拟进贡
        cc.systemEvent.on("GD_GM_FS"                , this.NotifiRefreshMainFuncBtns    , this);//刷新显示功能按钮
        cc.systemEvent.on("GD_GJ_GS"                , this.NotifiRefreshJinGongButton   , this);//刷新进贡按钮
        cc.systemEvent.on("GD_GH_GS"                , this.NotifiRefreshHuanGongButton  , this);//刷新还贡按钮
        cc.systemEvent.on("GD_GUI_UR"               , this.NotifiUserReady              , this);//刷新准备
        cc.systemEvent.on("GD_GUI_UCR"              , this.NotifiUserCancelReady        , this);//取消准备
        cc.systemEvent.on("GD_OTC_SE"               , this.NotifiOutCardState           , this);//用户出牌状态
        cc.systemEvent.on("GD_OT_CD"                , this.NotifiOutCard                , this);//用户出牌
        cc.systemEvent.on("GD_RN_OT"                , this.NotifiRefreshPassCard        , this);//用户过牌
        cc.systemEvent.on("GD_GU_RANK"              , this.NotifiRefreshBank            , this);//刷新名次
        cc.systemEvent.on("GD_SE_HD"                , this.NotifiShowStateHead          , this);//刷新头像
        cc.systemEvent.on("GD_WT_SE"                , this.NotifiWaitState              , this);//刷新准备状态
        cc.systemEvent.on("GD_SE_SE"                , this.NotifiStateStartGame         , this);//刷新开始状态
        cc.systemEvent.on("GD_FT_CD"                , this.NotifiFirstCard              , this);//发送手牌
        cc.systemEvent.on("GD_SC_SE"                , this.NotifiFirstCardState         , this);//刷新发送手牌相关状态
        cc.systemEvent.on("GD_SS_CT"                , this.NotifiShowStateCenterHint    , this);//刷新中心指示
        cc.systemEvent.on("GD_RF_CT"                , this.NotifiRefreshCenterHint      , this);//刷新中心指示方向
        cc.systemEvent.on("GD_TM_CT"                , this.NotifiCenterTime             , this);//刷新时间
        cc.systemEvent.on("GD_GH_CR"                , this.NotifiHideCardRiever         , this);//隐藏牌河
        cc.systemEvent.on("GD_JH_GG"                , this.NotifiPlayerSendOrRecvGift   , this);//刷新进贡效果
        cc.systemEvent.on("GD_JH_GF"                , this.NotifiPlayerSendOrRecvGiftEnd, this);//进贡还贡完成
        cc.systemEvent.on("GD_UR_AN"                , this.NotifiUserActionState        , this);//用户活动状态
        cc.systemEvent.on("GD_GU_SD"                , this.NotifiShowDown               , this);//结算
        cc.systemEvent.on("GD_RF_SC"                , this.NotifiSurplusCard            , this);//剩余牌数
        cc.systemEvent.on("GD_RH_VS"                , this.NotifiHandCardVisible        , this);//刷新手牌显示状态
        cc.systemEvent.on("GD_SH_TSH"               , this.NotifiShowTSH                , this);//显示同花顺
        cc.systemEvent.on("GD_MAKE_COLUMN"          , this.NotifiMakeColumn             , this);//整成一列
        cc.systemEvent.on("GD_CLENA_UP"             , this.NotifiCleanUp                , this);//重新整理
        cc.systemEvent.on("GD_RE_HC"                , this.NotifiRestHancCard           , this);//整理手牌完成
        cc.systemEvent.on("GD_CHAT_FACE"            , this.NotifiRevcRefreshFace        , this);//刷新表情动画
        cc.systemEvent.on("GD_CHAT_TEXT"            , this.NotifiRevcRefreshText        , this);//刷新文字聊天
        cc.systemEvent.on("GD_RF_RS"                , this.NotifiRefreshOfflineState    , this);//刷新在线离线状态
        cc.systemEvent.on("IM_RF"                   , this.NotifiRevcRefreshIM          , this);//刷新IM动画
        cc.systemEvent.on("GD_PJFE"                 , this.NotifiPlayJieFengEffect      , this);//播放借风特效
        cc.systemEvent.on("GD_KG"                   , this.NotifiKangGong               , this);//抗贡特效
        cc.systemEvent.on("GD_CLEARCARDSELECT"      , this.NotifiBGClick                , this);//点击大厅空白
        cc.systemEvent.on("GD_SH_RE_KING"           , this.NotifShowResistKing          , this);//显示抗贡大王
        cc.systemEvent.on("GD_RE_TSH"               , this.NotifRefreshTshBtns          , this);//刷新同花顺按钮显示
        cc.systemEvent.on("GD_HIDE_ROLE_GIFT"       , this.HideRoleGiftCardInfo         , this);//隐然所有角色贡牌信息
        cc.systemEvent.on("GD_SHOW_ROLE_GIFT"       , this.ShowRoleGiftCardInfo         , this);//显示所有角色贡牌信息
        cc.systemEvent.on("GD_TM_SEND_GIFT_CT"      , this.NotifiSendGiftCenterHint     , this);//刷新进贡时间
        cc.systemEvent.on("GD_TM_RECV_GIFT_CT"      , this.NotifiRecvGiftCenterHit      , this);//刷新还贡时间提示

        cc.systemEvent.emit("GD_RS_EG");
    }


    private InitGUI()
    {
        this.mSeatsList.Push( this.TopSeat );
        this.mSeatsList.Push( this.BottomSeat );
        this.mSeatsList.Push( this.LeftSeat );
        this.mSeatsList.Push( this.RightSeat );
        this.CenterHint.RefreshShowState(false);
        for (let i = 1; i <= this.mSeatsList.GetCount(); i++) 
        {
           this.mSeatsList.Get(i).GiftCardList = this.GiftCardList; 
        }
        AppFacade.Instance.GetSoundManager().PlayGameBackGroundMusic( GameDefine.RoomType , "game"); 
    }
   
    private NotifiSimulateGUI()
    {
        cc.systemEvent.emit("GD_BD_SS");                    //座位
        GuanDanScenes.Instance.UpdateCardPrompt();
        cc.systemEvent.emit("GD_ST_CE");                    //权限
        cc.systemEvent.emit("GD_GR_GL");                    //级别等
        cc.systemEvent.emit("GD_SE_HD", true );             //显示头像
        cc.systemEvent.emit("GD_GD_SE");                    //分数
        cc.systemEvent.emit("GD_GD_TE");                    //刷新队伍
        this.BottomSeat.SetCardLayout();
        this.BottomSeat.SetInitialLayout(false);
        this.BottomSeat.ClearMakeColumnCard();
        this.UIToolsList.RefreshGameCount();
        this.UIToolsList.RefreshFuncBtns(true);
        this.UIToolsList.RefreshRoomInfo();

        this.mSeatsList.ForEach( ( item ) =>
        {
            let GDSeat : UISeatsBase= item;
            GDSeat.ShowStateHead( true );
            GDSeat.ShowStateMoney(true);
            GDSeat.ShowStateName(true);
            GDSeat.ShowRemainCardNums();
            GDSeat.HideRank()
            GDSeat.SetCardLayout();
        });

        this.CenterHint.RefreshShowState( true );

        let ProtoBuf = NetManager.GetProtobuf();
        let State = GuanDanScenes.Instance.GuanDanRoomData.room_state;
        if ( State == ProtoBuf.TGuanDanState.TGuanDanStateAction )        { cc.systemEvent.emit("GD_TM_CT"           ,  GuanDanScenes.Instance.GetActionCenterTime() ); }
        else if ( State == ProtoBuf.TGuanDanState.TGuanDanStateSendGift ) { cc.systemEvent.emit("GD_TM_SEND_GIFT_CT" ,  GuanDanScenes.Instance.GetGiftCenterTime() );   } //显示进贡角色
        else if ( State == ProtoBuf.TGuanDanState.TGuanDanStateRecvGift ) { cc.systemEvent.emit("GD_TM_RECV_GIFT_CT" ,  GuanDanScenes.Instance.GetGiftCenterTime() );   } //显示还贡角色
        
        this.DrawCardRiver();
        this.RefreshRoleInfoRank();
        this.mPromptIdx = 1;
        this.mFreePromptIdx = -1;
        GuanDanScenes.Instance.AutoPass( 0.0 );
        if ( GuanDanScenes.Instance.IsStartGame() ){ this.RestReady(); }
        this.NotifRefreshTshBtns();									// 刷新同花顺按钮显示
        this.SimulateTeammateHandCard();
        cc.systemEvent.emit("GD_SHOW_ROLE_GIFT" );                  // 显示角色的贡牌信息
    }

    private NotifiBindSeats()
    {
        let NextSeats: number = 1;
        let Player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( PlayerDataModule.GetPID());
        if ( null == Player ) return;
        this.BottomSeat.SetBindID( PlayerDataModule.GetPID() );
        this.BottomSeat.SetBindSeats( GameDefine.GameSeats[1] );
        NextSeats = GuanDanScenes.Instance.GetNextSeats( Player.GetGameSeats() );
        this.RightSeat.SetBindID( GuanDanScenes.Instance.GetRoleID( NextSeats ) );
        this.RightSeat.SetBindSeats( GameDefine.GameSeats[2] );
        NextSeats = GuanDanScenes.Instance.GetNextSeats( NextSeats );
        this.TopSeat.SetBindID( GuanDanScenes.Instance.GetRoleID( NextSeats ) );
        this.TopSeat.SetBindSeats( GameDefine.GameSeats[3] );
        NextSeats = GuanDanScenes.Instance.GetNextSeats( NextSeats );
        this.LeftSeat.SetBindID( GuanDanScenes.Instance.GetRoleID( NextSeats ) );
        this.LeftSeat.SetBindSeats( GameDefine.GameSeats[4] );
        this.mSeatsList.ForEach( ( item ) => {
            let Seats = item;
            if( null != item )
            {
                let Player = GuanDanScenes.Instance.GetRolePlayer(Seats.GetBindID())
                if( null != Player )
                {
                    Player.SetGameSeats(Seats.GetBindSeats());
                }
            }
        })
    }

    //刷新权限
    public NotifiSelectChoice( Param : any )
    {
        let State = Param.detail;
        if ( State == null || State == undefined )
        {
            this.SetCardsOptionVisible( Util.Equal64Num( PlayerDataModule.GetPID() , GuanDanScenes.Instance.CurrActionUser ));
            return;
        }
        this.SetCardsOptionVisible( State );
    }

    private NotifiScore()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seat : UISeatsBase = item;
            if ( Seat == null ) return;
            Seat.GetRoleInfo().ShowMoney( Seat.BindRoleID ); 
        });
    }

    private NotifiGameLevel()
    {
        this.UIToolsList.InitGameLevel();
        this.UIToolsList.RefreshRoomNumber( false );
        this.UIToolsList.RefreshGameCount();
    }

    private NotifiTeam()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seat : UISeatsBase = item;
            if ( Seat == null ) return;
            let Player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( Seat.BindRoleID  ); 
            if ( Player == null ) return;
            Seat.GetRoleInfo().ShowTeam( Player.GetTeam() );
        });

        let MainPlayer = GuanDanScenes.Instance.GetRolePlayer(PlayerDataModule.GetPID());
        if ( null == MainPlayer) return;
        this.UIToolsList.RefreshTeamIcon(MainPlayer.GetTeam());
    }

    private NotifiRecvGiftCenterHit( Param )
    {
        if ( Param.detail == null ) return;
        let InTime =  Param.detail;
        let SeatList = [];
        for ( let i = 0; i < GuanDanScenes.Instance.CurGiftRoomRole.recv_info.length; i++ )
        {
            let Seats = this.GetSeats( GuanDanScenes.Instance.CurGiftRoomRole.recv_info[i].role_id );
            if ( Seats == null ) continue;
            SeatList.push( Seats.BindRoleID );
        }
        this.CenterHint.BeginMutilFlash( SeatList );
        this.CenterHint.RefreshTime( InTime );
    }

    private NotifiSendGiftCenterHint( Param )
    {
        if ( Param.detail == null ) return;
        let InTime =  Param.detail;
        let SeatList = [];
        for ( let i = 0; i < GuanDanScenes.Instance.CurGiftRoomRole.send_info.length; i++ )
        {
            let Seats = this.GetSeats( GuanDanScenes.Instance.CurGiftRoomRole.send_info[i].role_id );
            if ( Seats == null ) continue;
            SeatList.push( Seats.BindRoleID );
        }
        this.CenterHint.BeginMutilFlash( SeatList );
        this.CenterHint.RefreshTime( InTime );
    }

    private ShowRoleGiftCardInfo()
    {
        this.HideRoleGiftCardInfo();
        if ( GuanDanScenes.Instance.Send_Gift_Rolecard_Info == null ) return;
        if ( GuanDanScenes.Instance.Recv_Gift_Rolecard_Info == null ) return;
        // 进贡的
        for ( let i = 0; i < GuanDanScenes.Instance.Send_Gift_Rolecard_Info.length; i++ )
        {
            let SendGiftInfo = GuanDanScenes.Instance.Send_Gift_Rolecard_Info[i];
            let Seat = this.GetSeats( SendGiftInfo.gift_role );
            if ( Seat == null ) continue;
            let RoleInfo = Seat.GetRoleInfo();
            RoleInfo.SetGiftCardVisible( true );
            RoleInfo.SetGiftCardInfo( SendGiftInfo.gift_card , true );
        }

        // 还贡的
        for ( let i = 0; i < GuanDanScenes.Instance.Recv_Gift_Rolecard_Info.length; i++ )
        {
            let RecvGiftInfo = GuanDanScenes.Instance.Recv_Gift_Rolecard_Info[i];
            let Seat = this.GetSeats( RecvGiftInfo.gift_role );
            if ( Seat == null ) continue;
            let RoleInfo = Seat.GetRoleInfo();
            RoleInfo.SetGiftCardVisible( true );
            RoleInfo.SetGiftCardInfo( RecvGiftInfo.gift_card , false );
        }
    }

    private HideRoleGiftCardInfo()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seat : UISeatsBase = item;
            if ( Seat == null ) return;
            let RoleInfo = Seat.GetRoleInfo();
            RoleInfo.SetGiftCardVisible( false );
        });
    }

    private NotifRefreshTshBtns()
    {
        this.UIToolsList.RefreshTshBtn();
    }

    private NotifShowResistKing( Param )
    {
        if ( Param.detail == null ) return;
        let Show : boolean = Param.detail;
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seat : UISeatsBase = item;
            if ( Seat == null ) return;
            Seat.ShowResistKingCard( Show );
        });
    }

    private NotifiBGClick()
    {
        this.BottomSeat.InvertHandCardStretch();
    }

    private NotifiKangGong()
    {
        let Obj = ResourcesManager.LoadSpine(GameDefine.SpinePath + "GuanDan/baoh_wj" , this.EffectParent , false , "play" );
    }

    private NotifiPlayJieFengEffect()
    {
        let Seats = this.GetSeats( GuanDanScenes.Instance.JieFengID );
        Seats.PlayJieFengEffect();
    }

    private NotifiRevcRefreshIM()
    {
        
    }

    private NotifiRefreshOfflineState()
    {
        
    }

    // 文字聊天
    private NotifiRevcRefreshText( Message )
    {
        Message = Message.detail;
        if( null == Message ) return;
        let Seats = this.GetSeats( Message.pid );
        if( null == Seats ) return;
        Seats.GetRoleInfo().RefreshText( Message.text);
    }

    // 刷新表情
    private NotifiRevcRefreshFace( Message )
    {
        Message = Message.detail;
        if( null == Message ) return;
        let Seats = this.GetSeats( Message.pid );
        if( null == Seats ) return;
        Seats.GetRoleInfo().RefreshFace( parseInt(Message.text),Message.pid);
    }

    //整理完成
    private NotifiRestHancCard()
    {
        this.mPromptIdx = 1;
        this.mFreePromptIdx = -1;
    }

    //重新整理
    private NotifiCleanUp()
    {
        this.BottomSeat.ResetAllCardLayoutEx();
    }

    //整成一列
    private NotifiMakeColumn()
    {
        this.BottomSeat.ManagerCardsLayout();
    }

    //显示同花顺
    private NotifiShowTSH( Message )
    {
        let Ct = Message.detail;
        if( Ct == null ) return;
        this.BottomSeat.SelectCardByPromptOptiInfo( Ct );
    }

    //刷新手牌显示状态
    private NotifiHandCardVisible( State )
    {
        this.BottomSeat.RefreshHandCardVisible( State );
    }

    //刷新剩余牌数
    private NotifiSurplusCard()
    {
        let GDSeat = this.GetSeats( GuanDanScenes.Instance.CurrActionUser);
        if( null == GDSeat ) return;
        let GDPlayer = GuanDanScenes.Instance.GetRolePlayer( GDSeat.GetBindID() );
        if( null == GDPlayer ) return;
        GDSeat.RoleInfo.RefreshRemainCard( GDPlayer.GetHandNum() );
    }

    //收到结算消息
    private NotifiShowDown()
    {
        this.SetCardsOptionVisible( false );
        this.CenterHint.ResetState();
    }

    //模拟进贡
    private NotifiDrawGiftCard()
    {
        //隐藏用户权限
        cc.systemEvent.emit( "GD_ST_CE" , false );
        //隐藏功能按钮
        cc.systemEvent.emit( "GD_GM_FS" , false);

        let GiftInfo = GuanDanScenes.Instance.CurGiftRoomInfo;
        if( null != GiftInfo && null != GiftInfo.send_card && 0 != GiftInfo.send_card.card )
        {
            let Idx = -1;
            for (let i = 0; i < this.GiftCardList.length; i++) {
                if( this.GiftCardList[i].GetVisible() == false)
                {
                    Idx = i;
                    break;
                }
            }

            if ( Idx < 0 ) return;
            let GDCardUI : GDCardUIPanel = this.GiftCardList[Idx];
            let Pos : cc.Vec2 = this.GetGiftCardInitPos( Idx );
            GDCardUI.node.setPosition( Pos );
            let GDCardInfo = new GameCard(GiftInfo.send_card.index);
            GDCardUI.SetCardInfo(GDCardInfo);
            GDCardUI.SetVisible(true);
            GDCardUI.GetCardInfo().Index = GiftInfo.send_card.index;
            //显示贡牌标志
            GDCardUI.SetGiftCardFlag(true);
            GDCardUI.SetSendCardID( GiftInfo.scr_role_id );
            let PID = PlayerDataModule.GetPID();
            if( Util.Equal64Num( PID , GDCardUI.GetSendCardID ) )
            {
                return;
            }   
        }

        if(GuanDanScenes.Instance.IsSendGiftState())
        {
            let SendInfo = GuanDanScenes.Instance.CurGiftRoomRole.send_info;
            if( null != SendInfo )
            {
                for (let i = 0; i < SendInfo.length; i++) {
                    if( Util.Equal64Num( PlayerDataModule.GetPID() , SendInfo[i].role_id ) && SendInfo[i].is_complete == 0 )
                    {
                        cc.systemEvent.emit("GD_GJ_GS",true);
                        cc.systemEvent.emit("GD_GH_GS",false);
                        cc.systemEvent.emit("GD_GM_FS",false);      //功能按钮
                    }
                    else
                    {
                        cc.systemEvent.emit("GD_GM_FS",true);       //功能按钮
                    }
                }
            }
        }

        if(GuanDanScenes.Instance.IsRevcGiftState())
        {
            let RevcInfo = GuanDanScenes.Instance.CurGiftRoomRole.recv_info;
            if( null != RevcInfo)
            {
                for (let i = 0; i < RevcInfo.length ; i++) {
                    if( Util.Equal64Num( PlayerDataModule.GetPID() , RevcInfo[i].role_id ) && RevcInfo[i].is_complete == 0 )
                    {
                        cc.systemEvent.emit("GD_GJ_GS" , false );
                        cc.systemEvent.emit("GD_GH_GS" , true  );
                        cc.systemEvent.emit("GD_GM_FS" , false );
                    }
                    else
                    {
                        cc.systemEvent.emit("GD_GM_FS" , true );
                    }
                }
            }
        }
    }

    //获取进贡的牌初始位置
    private GetGiftCardInitPos( Idx : number)
    {
        if( Idx == 1 )
        {
            return new cc.Vec2( -100 , 80 );
        }
        else if( Idx == 2 )
        {
            return new cc.Vec2( 100 , 80 );
        }
        else
        {
            return new cc.Vec2( -100 , 80 );
        }
    }

    //刷新显示功能按钮
    private NotifiRefreshMainFuncBtns( State )
    {
        if (  State.detail == null )return; 
        this.UIToolsList.RefreshFuncBtns( State.detail);
    }

    //刷新进贡按钮
    private NotifiRefreshJinGongButton( State )
    {
        if (  State.detail == null )return; 
        this.UIToolsList.RefreshButtonSendGift( State.detail);
    }

    //刷新还贡按钮
    private NotifiRefreshHuanGongButton( State )
    {
        if (  State.detail == null )return; 
        this.UIToolsList.RefreshButtonRepayGift( State.detail);
    }
    
    //用户准备
    private NotifiUserReady( Param )
    {
        if (  Param.detail == null )return; 
        let ID = Param.detail;
        let Seat = this.GetSeats( ID );
        if ( Seat == null ) return;
        Seat.GetRoleInfo().RefreshReady( true );
        if ( Util.Equal64Num( ID , PlayerDataModule.GetPID() ) )
        {   
            this.UIToolsList.RefreshButtonReady( false );
        }
    }

    //用户取消准备
    private NotifiUserCancelReady( ID )
    {
        let Seats = this.GetSeats( ID );
        if( null == Seats ) return;
        Seats.GetRoleInfo().RefreshReady(false);
        if( ID == PlayerDataModule.GetPID() )
        {
            this.UIToolsList.RefreshButtonReady(true);
        }
    }

    //更新用户出牌状态
    private NotifiOutCardState()
    {
        this.UIToolsList.RefreshFuncBtns( true );   
    }

    //用户出牌
    private NotifiOutCard()
    {   
        let CurSeat : UISeatsBase = this.GetSeats( GuanDanScenes.Instance.CurrActionUser )
        if ( CurSeat == null ) return;
        GuanDanScenes.Instance.SetPutOutData();
	    GuanDanScenes.Instance.SetLastPlayerOutHandCardData();
	    CurSeat.RefreshHandCard();
	    let Kind = GuanDanScenes.Instance.CurUserOutCard.out_kind;
	    CurSeat.PlayCardKindEffect(Kind);
	    this.PlayOutCardAudio();
	    this.ShowTeammateHandCard();
    }

    //刷新过牌
    private NotifiRefreshPassCard( Param : any )
    {
        if ( Param.detail == null ) return;
        let RoleID =  Param.detail;
        let CurSeat : UISeatsBase = this.GetSeats( RoleID )
        if ( CurSeat == null ) return;
        CurSeat.RefreshPass( true );
        CurSeat.HideCardRiver();
        this.PlayPassCardAudio();
    }

    //刷新名次
    private NotifiRefreshBank()
    {
        this.mSeatsList.ForEach( ( item : UISeatsBase)=>
        {
            if ( item == null )return;
            let Rank = GuanDanScenes.Instance.GetPlayerRank( item.BindRoleID );
            item.GetRoleInfo().ShowRank( Rank );
        });
    }

    //玩家头像显示状态
    private NotifiShowStateHead( Msg : any )
    {
        let State : boolean = Msg.detail;
        this.mSeatsList.ForEach( ( item : UISeatsBase)=>
        {
            if ( item == null )return;
             item.ShowStateHead( false );
             item.ShowStateMoney( false );
			 item.ShowStateName( false );
			 item.ShowNewPlayer();
        });

        this.mSeatsList.ForEach( ( item : UISeatsBase)=>
        {
            if ( item == null ) return;
            if ( item.GamePlayer == null ) return;
            let Player = GuanDanScenes.Instance.GetRolePlayer(item.GetBindID());
            if ( Player == null ) return;
             item.ShowStateHead( State );
			 item.ShowStateMoney( State );
			 item.ShowStateName( State );
			item.GetRoleInfo().ShowTeam(Player.GetTeam());
        });

        let ProtoBuf = NetManager.GetProtobuf();
        this.mSeatsList.ForEach( ( item : UISeatsBase)=>
        {
            if ( item == null )return;
            if ( item.GamePlayer == null ) return;
            
            if ( item.GamePlayer.IsNewRole() )
            {
                let SoundMgr = AppFacade.Instance.GetSoundManager();
                SoundMgr.PlayGameSoundEffect(  GameDefine.RoomType , GameDefine.JinRuFangJian );
                item.GamePlayer.RemoveRoleState( ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_NEWROLE );
            }
        });
    }

    //刷新头像
    private NotifiRefreshHead( Message )
    {
        if( null == Message.detail ) return;
        let Seats = this.GetSeats( Message.detail );
        if( null == Seats ) return;
        Seats.ShowStateHead(true);
    }

    //刷新名字
    private NotifiRefreshName( Message )
    {
        if( null == Message.detail ) return;
        let Seats = this.GetSeats( Message.detail );
        if( null == Seats ) return;
        Seats.ShowStateName(true);
    }

    //刷新准备状态
    private NotifiWaitState()
    {
        this.SetReadyData();
        this.UIToolsList.RefreshFuncBtns(false);
        this.UIToolsList.RefreshBackBtnSate(true);
        this.UIToolsList.RefreshRoomNumber(true);
        this.UIToolsList.RefreshGameCount();
        this.UIToolsList.SimulateGUIButtonReady();
    }

    //设置准备功能相关的显示和数据
    private SetReadyData()
    {
        this.mSeatsList.ForEach( ( item : UISeatsBase)=>
        {
            if ( item == null )return;
            if ( item.GamePlayer== null ) return;
            item.GetRoleInfo().RefreshReady( item.GamePlayer.IsReady() );
        });
        this.UIToolsList.ShowReadyButton( true );
        this.UIToolsList.ShowInviteButton( true );
    }

    //重置界面
    private NotifiResetGUI( Msg : any )
    {
        let State : boolean = Msg.detail;
        this.SetCardsOptionVisible( State );
        this.RestReady();
        this.HideRemainCard();
        this.UIToolsList.RefreshFuncBtns( false );
        this.UIToolsList.RefreshButtonSendGift( false );
        this.UIToolsList.RefreshButtonRepayGift( false );
        this.UIToolsList.RefreshGameCount();
        this.UIToolsList.RefreshRoomInfo();
    }
    //设置权限按钮的可见性
    private SetCardsOptionVisible( IsShow : boolean )
    {
        this.CardOptionObj.active = IsShow;
        if ( IsShow )
        {
            //如果是设置可见的，需要看下是否能管上牌，如果没有，则不显示出牌
            let PromptInst : GuanDanGamePromptOpti = GuanDanScenes.Instance.GuanDanGamePromptOpti;
            let State = PromptInst.GetPromptList().GetCount() > 0
            this.BtnOut.node.active = State;
            this.BtnPrompt.node.active = State;
        }
        this.BtnPass.node.active = GuanDanScenes.Instance.IsCanPass()
    }

    //重置准备相关的控件
    private RestReady()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seats : UISeatsBase = item;
            if ( Seats == null ) return;
            Seats.GetRoleInfo().RefreshReady(false);
        });

        this.UIToolsList.ShowReadyButton( false );
        this.UIToolsList.ShowInviteButton( false );
    }

    //重置准备相关的控件
    private HideRemainCard()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seats : UISeatsBase = item;
            if ( Seats == null ) return;
             Seats.GetRoleInfo().RefreshRemainCard(1000);
        });
    }

    //游戏开始状态
    private NotifiStateStartGame()
    {
        this.RestReady();
        let SoundMgr = AppFacade.Instance.GetSoundManager();
        SoundMgr.PlayGameSoundEffect( GameDefine.RoomType , GameDefine.YouXiKaiShi );
        ResourcesManager.LoadSpine(GameDefine.SpinePath + "GuanDan/kaishiyouxi" , this.EffectParent , false , "play")
        this.UIToolsList.RefreshSpecialButton( false );
        this.UIToolsList.RefreshBackBtnSate(false);
        this.UIToolsList.RefreshRoomNumber( false );
    }

    //发送手牌
    private NotifiFirstCard()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seats : UISeatsBase = item;
            if ( Seats == null ) return;
            Seats.SetCardLayout();
        });
        this.BottomSeat.SetInitialLayout(true);
        this.TopSeat.ClearHandCards();
        this.BottomSeat.ClearMakeColumnCard();
        this.CenterHint.EndFalsh();
    }

    //刷新发牌状态相关
    private NotifiFirstCardState()
    {
        this.UIToolsList.RefreshFuncBtns( true );
        this.HideRemainCard();
        this.mSeatsList.ForEach( ( item : UISeatsBase ) =>
        {
            if ( item == null ) return;
            item.GetRoleInfo().RefreshReady(false);
            item.HideRank();
        });
        this.UIToolsList.ShowReadyButton(false);
        this.UIToolsList.ShowInviteButton(false);
	    this.NotifiRefreshOfflineState();
    }

    //中心显示状态
    private NotifiShowStateCenterHint( Param )
    {
        if ( Param.detail == null ) return;
        this.CenterHint.RefreshShowState( Param.detail );
    }

    //刷新中心提示
    private NotifiRefreshCenterHint()
    {
        let Seats = this.GetSeats( GuanDanScenes.Instance.CurrActionUser );
        if ( Seats == null ) return;
        this.CenterHint.BeginFlash( Seats.GetBindSeats() );
    }

    //刷新中心时间
    private NotifiCenterTime( Param )
    {
        if ( Param.detail == null ) return; 
        let Time = Param.detail;
        let Seats = this.GetSeats( GuanDanScenes.Instance.CurrActionUser );
        if ( Seats == null ) return;
        this.CenterHint.BeginFlash( Seats.GetBindSeats() );
        this.CenterHint.RefreshTime( Time  );
    }

    //隐藏牌河
    private NotifiHideCardRiever()
    {
        this.mSeatsList.ForEach( (item : UISeatsBase)=>
        {
           item.HideCardRiver();
           item.RefreshPass( false );
        } );
    }

    //进贡还贡效果
    private NotifiPlayerSendOrRecvGift()
    {
        let GDRoomData = GuanDanScenes.Instance.GuanDanRoomData;
        if( null == GDRoomData ) return;
        let ID :number = GDRoomData.gift_card.scr_role_id;
        let GDSeat : UISeatsBase = this.GetSeats(ID);
        if( null == GDSeat ) return;
        GDSeat.ShowSendGiftCardEffect(GDRoomData.gift_card.send_card);
    }

    //进贡还贡完成
    private NotifiPlayerSendOrRecvGiftEnd()
    {
        let MsgGiftCardInfo = GuanDanScenes.Instance.CurGiftRoomInfo;
        let id = MsgGiftCardInfo.tar_role_id;
        let GDSeat = this.GetSeats(id);
        if( null == GDSeat)
        {
            return;
        }
        GDSeat.ShowRecvGiftCardEffect();
    }

    //用户活动状态
    private NotifiUserActionState()
    {
        let Seat : UISeatsBase = this.GetSeats( GuanDanScenes.Instance.CurrActionUser );
        if ( Seat == null )return;
        Seat.HideCardRiver();
        this.TryHideOtherSeatRiverCard();
        Seat.RefreshPass( false );
    }

    //尝试隐藏上一家的牌河
    private TryHideOtherSeatRiverCard()
    {
        this.mSeatsList.ForEach( (item : UISeatsBase) => {
            let Player = item.GamePlayer;
            //如果某个玩家处于上一个活动玩家和当前活动玩家之间，同时没有牌了，需要清空一下牌河
            if( GuanDanScenes.Instance.IsPlayerBetweenLC(Player.GetPID()))
            {
                if( Player.GetHandNum() == 0 )
                {
                    item.HideCardRiver();
                }
            }
        } )
    }

    //获取玩家座位
    public GetSeats( ID :  number ) :UISeatsBase
    {
        for ( let i = 1 ; i <= this.mSeatsList.GetCount(); i++ )
        {
            let Seats = this.mSeatsList.Get( i );
            if ( Seats == null ) continue;
            if ( Util.Equal64Num(ID , Seats.BindRoleID ))
            {
                return Seats;
            }
        }
        return null;
    }   
    
    //刷新名次显示
    private RefreshRoleInfoRank()
    {
        this.mSeatsList.ForEach( (item : UISeatsBase)=>
        {
            let Rank = GuanDanScenes.Instance.GetPlayerRank( item.BindRoleID );
            item.RoleInfo.ShowRank( Rank );
        } );
    }

    //绘制牌河
    private DrawCardRiver()
    {
        let OutCardInfo = GuanDanScenes.Instance.CurUserOutCard;
        if ( OutCardInfo == null ) return
        let OldRoleID   = OutCardInfo.old_actionid;
        let GDSeat : UISeatsBase = this.GetSeats( OldRoleID );
        if ( GDSeat == null )return;
        if ( Util.Equal64Num( OldRoleID, OutCardInfo.new_actionid ) )
        {
            this.mSeatsList.ForEach( ( item :UISeatsBase ) =>
            {
                if ( item != GDSeat )
                {  
                     item.RefreshPass( true );
                }
            });
        }else
        {
            GDSeat.SetCardRiver( OutCardInfo.out_card );
        }

    }

 //播放出牌音效
    private PlayOutCardAudio()
    {
        if( null == GuanDanScenes.Instance.CurUserOutCard ) return
        let GDPlayer = GuanDanScenes.Instance.GetRolePlayer( GuanDanScenes.Instance.CurUserOutCard.old_actionid );
        if( null == GDPlayer) return;
        let Man :boolean = true;
        //获取性别
        let sex = HeadPoolModule.GetWxSex(GDPlayer.GetPID());
        if(null != sex)
        {
            Man = (sex == 1);
        }
        let Kind : number = GuanDanScenes.Instance.CurUserOutCard.out_kind & GameDefine.GDCardTypeMask;
        let AudioName : string = this.GetOutAudioName( Kind , Man );
        AppFacade.Instance.GetSoundManager().PlayGameSoundEffect(GameDefine.RoomType , AudioName);        
    }

    //获取音效名字
    private GetOutAudioName( Kind : number , Man : boolean ) : string
    {
        let ProtoBuf = NetManager.GetProtobuf();
       if( Kind ==  ProtoBuf.TGuanDanCT.CT_SINGLE)
       {
           let GDCard : GameCard = GuanDanScenes.Instance.LastPlayerPutOutCars.Get(1);
           if( null == GDCard ) return "";
           let Value : number = 0;
           if( GDCard.Color == 64 )                     //64是大小王
           {
               Value = GDCard.Value +13;
           }
           else
           {
               Value = GDCard.Value;
           }
           let AudioName : string = GameDefine.GetCardAudioPath( Value , Man , 1 );
           return AudioName;
        }
        else if( Kind == ProtoBuf.TGuanDanCT.CT_DOUBLE )
        {
            let GDCard :GameCard = GuanDanScenes.Instance.LastPlayerPutOutCars.Get(2);
            if( null == GDCard ) return "";
            let Value :number = 0;
            if(GDCard.Color == 64)                      //64是大小王
            {
                Value = GDCard.Value +13;
            }
            else
            {
                Value = GDCard.Value;
            }
            let AudioName : string = GameDefine.GetCardAudioPath( Value , Man , 2 );
            return AudioName;
        }
        else
        {
            let AudioName : string = GameDefine.GetSpecialCardAudioPath( Kind , Man )
            return AudioName;
        }
    }

    //显示队友手牌
    private ShowTeammateHandCard()
    {
        if( null == GuanDanScenes.Instance.CurUserOutCard ) return;
        if( null == GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card) return;

        //获取队友的ID
        let TeammateID : number = GuanDanScenes.Instance.GetTeammateID();
        if( 0 == TeammateID ) return;
        if( !Util.Equal64Num( GuanDanScenes.Instance.CurrActionUser , PlayerDataModule.GetPID() ) && !Util.Equal64Num( GuanDanScenes.Instance.CurrActionUser , TeammateID) ) return;

        //获取itemID 对应的Seatm ，其实肯定是Top，如果不是，就是错了
        let TeammateSeat :UISeatsBase = this.GetSeats(TeammateID);
        if( null == TeammateSeat ) return;   
        if(TeammateSeat != this.TopSeat) return;            //一定是上方的座位

        if( 0 == Object.keys(GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card).length )
        {
            TeammateSeat.ClearHandCards();
            TeammateSeat.ClearGroup();
            return;
        }
        
        let Teammate :GamePlayer = TeammateSeat.GamePlayer;
        if( null == Teammate ) return;

        //刷新手牌
        Teammate.AddHandCardList( GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card);
        Teammate.SetHandNum( Object.keys(GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card).length );

        //刷新UI显示
        TeammateSeat.SetInitialLayout(false);

        if( Object.keys(GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card).length > 0 && GuanDanScenes.Instance.GetMainPlayerCardNums() == 0)
        {
            this.UIToolsList.RefreshFuncBtns(false);
        }
    }

    //模拟gui显示队友手牌
    private SimulateTeammateHandCard()
    {
        let TeamID =  GuanDanScenes.Instance.GetTeammateID();
        let a = GuanDanScenes.Instance.CurUserOutCard 
        let b = GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card
        let c = GuanDanScenes.Instance.GetMainPlayerCardNums()
        if ( GuanDanScenes.Instance.CurUserOutCard == null
          || GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card == null
          || GuanDanScenes.Instance.GetMainPlayerCardNums() > 0
          || TeamID == 0
        )
        {
            return;
        }
        let Seat : UISeatsBase = this.GetSeats( TeamID );
        if ( Seat != this.TopSeat )
        {
            return;
        }
        let Teammate = Seat.GamePlayer;
        if ( Teammate == null )
        {
            return;
        }
        //刷新手牌
        Teammate.AddHandCardList( GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card );
        Teammate.SetHandNum( GuanDanScenes.Instance.CurUserOutCard.teammate_hand_card.length );
        //刷新UI显示
        Seat.SetInitialLayout( false );
        this.UIToolsList.RefreshFuncBtns(false);
    }

    // 过牌音效
    private PlayPassCardAudio()
    {
        if( null == GuanDanScenes.Instance.CurUserPassCard ) return;
        let GDPlayer = GuanDanScenes.Instance.GetRolePlayer( GuanDanScenes.Instance.CurUserPassCard.old_actionid );
        if( null == GDPlayer ) return;
        let Man = true;
        let Sex = HeadPoolModule.GetWxSex( GDPlayer.GetPID() );
        if( null != Sex)
        {
            Man = (Sex == 1);
        }
        let AudioName = "";
        if(Man)
        {
            AudioName = GameDefine.GDMGuo;
        }
        else
        {
            AudioName = GameDefine.GDWGuo;
        }
        let SoundMgr = AppFacade.Instance.GetSoundManager();
        SoundMgr.PlayGameSoundEffect(  GameDefine.RoomType , AudioName );
    }

    //过
    public OnClickBtnPass()
    {
        this.PlayButtonAudio();
        this.mPromptIdx     = 1;
        this.mFreePromptIdx = -1;
        GuanDanScenes.Instance.SendPass();
    }

    //出牌
    public OnClickBtnOut()
    {
        this.PlayButtonAudio();
        //生成选中牌的列表
        let SelectList = new LinkedList();
        this.BottomSeat.HandCardList.ForEach( ( GDCard : GDCardUIPanel)=>
        {
            if ( GDCard == null ) return;
            if ( GDCard.GetSelected() ){  SelectList.Push( GDCard.GetCardInfo() ); }
        } );
        if ( SelectList.GetCount() == 0 ) return;
        this.mPromptIdx = 1;
        this.mFreePromptIdx = -1;
        GuanDanScenes.Instance.SendOutCard( SelectList );
    }

    //提示
    public OnClickBtnPrompt()
    {
        this.PlayButtonAudio();
        GuanDanScenes.Instance.UpdateCardPrompt();
        GuanDanScenes.Instance.CardGrpPrompt.PromptAll( this.BottomSeat.HandCardGrpList );
        if ( GuanDanScenes.Instance.IsFreeOutCard() )
        {
            let MyGrpList : LinkedList = this.BottomSeat.HandCardGrpList;
            if ( MyGrpList.GetCount() <= 0 ) return;
            if ( this.mFreePromptIdx < 1 ) 
            { 
                this.mFreePromptIdx = MyGrpList.GetCount(); 
            }
            this.BottomSeat.SelectGrpCardOnly( this.mFreePromptIdx );
            this.mFreePromptIdx--;
        }
        else
        {
            let PrompLength = GuanDanScenes.Instance.GuanDanGamePromptOpti.GetPromptList().GetCount()
            if ( PrompLength <= 0 )
            {
                this.AutoPass();
            }
            else
            {
                GuanDanScenes.Instance.GuanDanGamePromptOpti.RemoveGrpPromptRepeat( GuanDanScenes.Instance.CardGrpPrompt.AllPromptList );
                let CardGrpLength = GuanDanScenes.Instance.CardGrpPrompt.AllPromptList.GetCount()
                let Count = PrompLength + CardGrpLength;
                if ( this.mPromptIdx > Count )
                {
                    this.mPromptIdx = 1;
                }
                if ( this.mPromptIdx <= CardGrpLength )
                {
                    this.BottomSeat.SelectCardByGrpPromptInfo( GuanDanScenes.Instance.CardGrpPrompt.AllPromptList.Get(this.mPromptIdx) );
                }else
                {
                    this.BottomSeat.SelectCardByPromptOptiInfo( GuanDanScenes.Instance.GuanDanGamePromptOpti.GetPromptList().Get( this.mPromptIdx - CardGrpLength ) );
                }
                this.mPromptIdx++;
            }
        }
    }

    // 自动过牌
    private AutoPass()
    {
        //提示
        //
        GuanDanScenes.Instance.SendPass();
    }


    onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_HEAD           , this.NotifiRefreshHead               , this);//重置界面
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_NAME           , this.NotifiRefreshName               , this);//重置界面   
        cc.systemEvent.off("GD_RT_DA"                , this.NotifiResetGUI               , this);//重置界面
        cc.systemEvent.off("GD_SIMUL"                , this.NotifiSimulateGUI            , this);//模拟GUI
        cc.systemEvent.off("GD_BD_SS"                , this.NotifiBindSeats              , this);//座位
        cc.systemEvent.off("GD_ST_CE"                , this.NotifiSelectChoice           , this);//刷新权限
        cc.systemEvent.off("GD_GR_GL"                , this.NotifiGameLevel              , this);//刷新游戏级别
        cc.systemEvent.off("GD_GD_SE"                , this.NotifiScore                  , this);//刷新分数
        cc.systemEvent.off("GD_GD_TE"                , this.NotifiTeam                   , this);//刷新队伍
        cc.systemEvent.off("GD_SI_GN"                , this.NotifiDrawGiftCard           , this);//模拟进贡
        cc.systemEvent.off("GD_GM_FS"                , this.NotifiRefreshMainFuncBtns    , this);//刷新显示功能按钮
        cc.systemEvent.off("GD_GJ_GS"                , this.NotifiRefreshJinGongButton   , this);//刷新进贡按钮
        cc.systemEvent.off("GD_GH_GS"                , this.NotifiRefreshHuanGongButton  , this);//刷新还贡按钮
        cc.systemEvent.off("GD_GUI_UR"               , this.NotifiUserReady              , this);//刷新准备
        cc.systemEvent.off("GD_GUI_UCR"              , this.NotifiUserCancelReady        , this);//取消准备
        cc.systemEvent.off("GD_OTC_SE"               , this.NotifiOutCardState           , this);//用户出牌状态
        cc.systemEvent.off("GD_OT_CD"                , this.NotifiOutCard                , this);//用户出牌
        cc.systemEvent.off("GD_RN_OT"                , this.NotifiRefreshPassCard        , this);//用户过牌
        cc.systemEvent.off("GD_GU_RANK"              , this.NotifiRefreshBank            , this);//刷新名次
        cc.systemEvent.off("GD_SE_HD"                , this.NotifiShowStateHead          , this);//刷新头像
        cc.systemEvent.off("GD_WT_SE"                , this.NotifiWaitState              , this);//刷新准备状态
        cc.systemEvent.off("GD_SE_SE"                , this.NotifiStateStartGame         , this);//刷新开始状态
        cc.systemEvent.off("GD_FT_CD"                , this.NotifiFirstCard              , this);//发送手牌
        cc.systemEvent.off("GD_SC_SE"                , this.NotifiFirstCardState         , this);//刷新发送手牌相关状态
        cc.systemEvent.off("GD_SS_CT"                , this.NotifiShowStateCenterHint    , this);//刷新中心指示
        cc.systemEvent.off("GD_RF_CT"                , this.NotifiRefreshCenterHint      , this);//刷新中心指示方向
        cc.systemEvent.off("GD_TM_CT"                , this.NotifiCenterTime             , this);//刷新时间
        cc.systemEvent.off("GD_GH_CR"                , this.NotifiHideCardRiever         , this);//隐藏牌河
        cc.systemEvent.off("GD_JH_GG"                , this.NotifiPlayerSendOrRecvGift   , this);//刷新进贡效果
        cc.systemEvent.off("GD_JH_GF"                , this.NotifiPlayerSendOrRecvGiftEnd, this);//进贡还贡完成
        cc.systemEvent.off("GD_UR_AN"                , this.NotifiUserActionState        , this);//用户活动状态
        cc.systemEvent.off("GD_GU_SD"                , this.NotifiShowDown               , this);//结算
        cc.systemEvent.off("GD_RF_SC"                , this.NotifiSurplusCard            , this);//剩余牌数
        cc.systemEvent.off("GD_RH_VS"                , this.NotifiHandCardVisible        , this);//刷新手牌显示状态
        cc.systemEvent.off("GD_SH_TSH"               , this.NotifiShowTSH                , this);//显示同花顺
        cc.systemEvent.off("GD_MAKE_COLUMN"          , this.NotifiMakeColumn             , this);//整成一列
        cc.systemEvent.off("GD_CLENA_UP"             , this.NotifiCleanUp                , this);//重新整理
        cc.systemEvent.off("GD_RE_HC"                , this.NotifiRestHancCard           , this);//整理手牌完成
        cc.systemEvent.off("GD_CHAT_FACE"            , this.NotifiRevcRefreshFace        , this);//刷新表情动画
        cc.systemEvent.off("GD_CHAT_TEXT"            , this.NotifiRevcRefreshText        , this);//刷新文字聊天
        cc.systemEvent.off("GD_RF_RS"                , this.NotifiRefreshOfflineState    , this);//刷新在线离线状态
        cc.systemEvent.off("IM_RF"                   , this.NotifiRevcRefreshIM          , this);//刷新IM动画
        cc.systemEvent.off("GD_PJFE"                 , this.NotifiPlayJieFengEffect      , this);//播放借风特效
        cc.systemEvent.off("GD_KG"                   , this.NotifiKangGong               , this);//抗贡特效
        cc.systemEvent.off("GD_CLEARCARDSELECT"      , this.NotifiBGClick                , this);//点击大厅空白
        cc.systemEvent.off("GD_SH_RE_KING"           , this.NotifShowResistKing          , this);//显示抗贡大王
        cc.systemEvent.off("GD_RE_TSH"               , this.NotifRefreshTshBtns          , this);//刷新同花顺按钮显示
        cc.systemEvent.off("GD_HIDE_ROLE_GIFT"       , this.HideRoleGiftCardInfo         , this);//隐然所有角色贡牌信息
        cc.systemEvent.off("GD_SHOW_ROLE_GIFT"       , this.ShowRoleGiftCardInfo         , this);//显示所有角色贡牌信息
        cc.systemEvent.off("GD_TM_SEND_GIFT_CT"      , this.NotifiSendGiftCenterHint     , this);//刷新进贡时间
        cc.systemEvent.off("GD_TM_RECV_GIFT_CT"      , this.NotifiRecvGiftCenterHit      , this);//刷新还贡时间提示
    }


}

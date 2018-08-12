import EventName from "../../Common/Event/EventName";
import GamePlayer from "../Module/GamePlayer";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import GameDefine from "../Module/GameDefine";
import LinkedList from "../../Common/DataStruct/LinkedList";
import { GuanDanGamePromptOpti } from "../Module/GuanDanGamePromptOpti";
import NetManager from "../../Common/Net/NetManager";
import AppFacade from "../../Framework/AppFacade";
import Util from "../../Utility/Util";
import { Message } from "../../Common/Net/Message";
import GameCard from "../Module/GameCard";
import UIBase from "../../Common/UI/UIBase";
import ResourcesManager from "../../Framework/ResourcesManager";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";
import UIRecordToolsList from "./UIRecordToolsList";
import UIRecordSeatsBottom from "./UIRecordSeatsBottom";
import UIRecordSeatsRight from "./UIRecordSeatsRight";
import UIRecordSeatsTop from "./UIRecordSeatsTop";
import UIRecordSeatsLeft from "./UIRecordSeatsLeft";
import GDRecordCardUIPanel from "./GDRecordCardUIPanel";
import UIRecordSeatsBase from "./UIRecordSeatsBase";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRecordGame extends UIBase
{
    @property( UIRecordToolsList )
    UIToolsList : UIRecordToolsList = null; 

    @property( UIRecordSeatsBottom )
    BottomSeat : UIRecordSeatsBottom = null; 

    @property( UIRecordSeatsRight )
    RightSeat : UIRecordSeatsRight  = null; 

    @property( UIRecordSeatsTop )
    TopSeat : UIRecordSeatsTop    = null; 

    @property( UIRecordSeatsLeft )
    LeftSeat : UIRecordSeatsLeft   = null; 

    @property( cc.Node )
    EffectParent : cc.Node   = null; 
    
    @property( cc.Node )
    GiftCardParent : cc.Node  = null; 

    @property(GDRecordCardUIPanel)
    GiftCardList: GDRecordCardUIPanel[] = [];

    private mPromptIdx       :  number   = 1;
    private mFreePromptIdx   :  number   = -1;//自由出牌的索引

    private mSeatsList       : LinkedList = new LinkedList();

    onLoad () 
    {
    }

    start () 
    {
        this.InitGUI();
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_HEAD   , this.NotifiRefreshHead            , this);//重置界面
        cc.systemEvent.on(EventName.EVENT_UI_REFRESH_NAME   , this.NotifiRefreshName            , this);//重置界面        
        cc.systemEvent.on("GD_RT_DA"                        , this.NotifiResetGUI               , this);//重置界面
        cc.systemEvent.on("GD_SIMUL"                        , this.NotifiSimulateGUI            , this);//模拟GUI
        cc.systemEvent.on("GD_BD_SS"                        , this.NotifiBindSeats              , this);//座位
        cc.systemEvent.on("GD_GR_GL"                        , this.NotifiGameLevel              , this);//刷新游戏级别
        cc.systemEvent.on("GD_GD_SE"                        , this.NotifiScore                  , this);//刷新分数
        cc.systemEvent.on("GD_GD_TE"                        , this.NotifiTeam                   , this);//刷新队伍
        cc.systemEvent.on("GD_SI_GN"                        , this.NotifiDrawGiftCard           , this);//模拟进贡
        cc.systemEvent.on("GD_OTC_SE"                       , this.NotifiOutCardState           , this);//用户出牌状态
        cc.systemEvent.on("GD_OT_CD"                        , this.NotifiOutCard                , this);//用户出牌
        cc.systemEvent.on("GD_RN_OT"                        , this.NotifiRefreshPassCard        , this);//用户过牌
        cc.systemEvent.on("GD_GU_RANK"                      , this.NotifiRefreshBank            , this);//刷新名次
        cc.systemEvent.on("GD_SE_HD"                        , this.NotifiShowStateHead          , this);//刷新头像
        cc.systemEvent.on("GD_FT_CD"                        , this.NotifiFirstCard              , this);//发送手牌
        cc.systemEvent.on("GD_JH_RG"                        , this.NotifiResistGift              , this);//抗贡效果
        cc.systemEvent.on("GD_SC_SE"                        , this.NotifiFirstCardState         , this);//刷新发送手牌相关状态
        cc.systemEvent.on("GD_GH_CR"                        , this.NotifiHideCardRiever         , this);//隐藏牌河
        cc.systemEvent.on("GD_JH_GG"                        , this.NotifiPlayerSendOrRecvGift   , this);//刷新进贡效果
        cc.systemEvent.on("GD_JH_GF"                        , this.NotifiPlayerSendOrRecvGiftEnd, this);//进贡还贡完成
        cc.systemEvent.on("GD_UR_AN"                        , this.NotifiUserActionState        , this);//用户活动状态
        cc.systemEvent.on("GD_GU_SD"                        , this.NotifiShowDown               , this);//结算
        cc.systemEvent.on("GD_RH_VS"                        , this.NotifiHandCardVisible        , this);//刷新手牌显示状态
        cc.systemEvent.on("RE_ST"                           , this.NotifiRecordOverStopPlay     , this);//回放结束停止快进和播放按钮的响应

        cc.systemEvent.emit("GD_RS_EG");
    }


    private InitGUI()
    {
        this.mSeatsList.Push( this.TopSeat );
        this.mSeatsList.Push( this.BottomSeat );
        this.mSeatsList.Push( this.LeftSeat );
        this.mSeatsList.Push( this.RightSeat );
        for (let i = 1; i <= this.mSeatsList.GetCount(); i++) 
        {
           this.mSeatsList.Get(i).GiftCardList = this.GiftCardList; 
        }
        AppFacade.Instance.GetSoundManager().PlayGameBackGroundMusic( GameDefine.RoomType , "game"); 
    }

    //刷新头像
    private NotifiRefreshHead( Msg )
    {
        let RoleID = Msg.detail;
        if( RoleID == null ) return;
        let Seats= this.GetSeats( RoleID );
        if( null == Seats ) return;
        Seats.ShowStateHead(true);
    }

    //刷新名字
    private NotifiRefreshName( Msg )
    {
        let RoleID = Msg.detail;
        if( RoleID == null ) return;
        let Seats= this.GetSeats( RoleID );
        if( null == Seats ) return;
        Seats.ShowStateName(true);
    }
   
    //模拟GUI
    private NotifiSimulateGUI()
    {
        cc.systemEvent.emit("GD_BD_SS");                    //座位
        cc.systemEvent.emit("GD_GR_GL");                    //级别等
        cc.systemEvent.emit("GD_GD_SE");                    //分数
        cc.systemEvent.emit("GD_GD_TE");                    //刷新队伍
        
        this.mSeatsList.ForEach( ( item ) =>
        {
            let GDSeat : UIRecordSeatsBase= item;
            GDSeat.SetCardLayout();
            GDSeat.SetInitialLayout(false);
            GDSeat.ShowStateHead( true );
            GDSeat.ShowStateMoney(true);
            GDSeat.ShowStateName(true);
            GDSeat.HideRank()
            
        });

        this.UIToolsList.RefreshGameCount();
        this.UIToolsList.RefreshRoomInfo();
        this.DrawCardRiver();
        this.RefreshRoleInfoRank();
    }

    //设置座位
    private NotifiBindSeats()
    {
        let NextSeats: number = 1;
        let Player : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( PlayerDataModule.GetPID());
        if ( null == Player ) return;
        this.BottomSeat.SetBindID( PlayerDataModule.GetPID() );
        this.BottomSeat.SetBindSeats( GameDefine.GameSeats[1] );
        NextSeats = RecordGuanDanScenes.Instance.GetNextSeats( Player.GetGameSeats() );
        this.RightSeat.SetBindID( RecordGuanDanScenes.Instance.GetRoleID( NextSeats ) );
        this.RightSeat.SetBindSeats( GameDefine.GameSeats[2] );
        NextSeats = RecordGuanDanScenes.Instance.GetNextSeats( NextSeats );
        this.TopSeat.SetBindID( RecordGuanDanScenes.Instance.GetRoleID( NextSeats ) );
        this.TopSeat.SetBindSeats( GameDefine.GameSeats[3] );
        NextSeats = RecordGuanDanScenes.Instance.GetNextSeats( NextSeats );
        this.LeftSeat.SetBindID( RecordGuanDanScenes.Instance.GetRoleID( NextSeats ) );
        this.LeftSeat.SetBindSeats( GameDefine.GameSeats[4] );
        this.mSeatsList.ForEach( ( item ) => {
            let Seats = item;
            if( null != item )
            {
                let Player = RecordGuanDanScenes.Instance.GetRolePlayer(Seats.GetBindID())
                if( null != Player )
                {
                    Player.SetGameSeats(Seats.GetBindSeats());
                }
            }
        })
        RecordGuanDanScenes.Instance.GetRoleID( 0 );
    }

    //刷新游戏分数
    private NotifiScore()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seat : UIRecordSeatsBase = item;
            if ( Seat == null ) return;
            Seat.GetRoleInfo().ShowMoney( Seat.BindRoleID ); 
        });
    }

    //刷新游戏级别
    private NotifiGameLevel()
    {
        this.UIToolsList.InitGameLevel();
        this.UIToolsList.RefreshGameCount();
    }

    //刷新队伍
    private NotifiTeam()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seat : UIRecordSeatsBase = item;
            if ( Seat == null ) return;
            let Player : GamePlayer = RecordGuanDanScenes.Instance.GetRolePlayer( Seat.BindRoleID  ); 
            if ( Player == null ) return;
            Seat.GetRoleInfo().ShowTeam( Player.GetTeam() );
        });

        let MainPlayer = RecordGuanDanScenes.Instance.GetRolePlayer(PlayerDataModule.GetPID());
        if ( null == MainPlayer) return;
        this.UIToolsList.RefreshTeamIcon(MainPlayer.GetTeam());
    }

    //刷新手牌显示状态
    private NotifiHandCardVisible( State )
    {
        this.BottomSeat.RefreshHandCardVisible( State );
    }

    private NotifiRecordOverStopPlay()
    {
        this.UIToolsList.RecordOverStopPlay();
    }

  

    private NotifiShowDown()
    {
    }

    //模拟进贡
    private NotifiDrawGiftCard()
    {
        //隐藏功能按钮
        cc.systemEvent.emit( "GD_GM_FS" , false);

        let GiftInfo = RecordGuanDanScenes.Instance.CurGiftRoomInfo();
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
            let GDCardUI : GDRecordCardUIPanel = this.GiftCardList[Idx];
            let Pos : cc.Vec2 = this.GetGiftCardInitPos( Idx );
            GDCardUI.node.setPosition( Pos );
            let GDCardInfo = new GameCard(GiftInfo.send_card.index);
            GDCardUI.SetCardInfo(GDCardInfo);
            GDCardUI.SetVisible(true);
            GDCardUI.GetCardInfo().Index = GiftInfo.send_card.index;
            GDCardUI.SetSendCardID( GiftInfo.scr_role_id );
            let PID = PlayerDataModule.GetPID();
            if( Util.Equal64Num( PID , GDCardUI.GetSendCardID ) )
            {
                return;
            }   
        }

        if(RecordGuanDanScenes.Instance.IsSendGiftState())
        {
            let SendInfo = RecordGuanDanScenes.Instance.CurGiftRoomRole.send_info;
            if( null != SendInfo )
            {
                for (let i = 0; i < SendInfo.length; i++) {
                    if( Util.Equal64Num( PlayerDataModule.GetPID() , SendInfo[i].role_id ) && SendInfo[i].is_complete == 0 )
                    {
                        cc.systemEvent.emit("GD_GJ_GS",true);
                        cc.systemEvent.emit("GD_GH_GS",false);
                    }
                }
            }

        }

        if(RecordGuanDanScenes.Instance.IsRevcGiftState())
        {
            let RevcInfo = RecordGuanDanScenes.Instance.CurGiftRoomRole().recv_info;
            if( null != RevcInfo)
            {
                for (let i = 0; i < RevcInfo.length ; i++) {
                    if( Util.Equal64Num( PlayerDataModule.GetPID() , RevcInfo[i].role_id ) && RevcInfo[i].is_complete == 0 )
                    {
                        cc.systemEvent.emit("GD_GJ_GS" , false );
                        cc.systemEvent.emit("GD_GH_GS" , true  );
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
    //抗贡效果
    private NotifiResistGift()
    {
        let Obj = ResourcesManager.LoadSpine(GameDefine.SpinePath + "GuanDan/baoh_wj" , this.EffectParent , false , "play" );
    }

    private NotifiOutCardState()
    {
    }
    //用户出牌
    private NotifiOutCard()
    {   
        let CurSeat : UIRecordSeatsBase = this.GetSeats( RecordGuanDanScenes.Instance.CurrActionUser )
        if ( CurSeat == null ) return;
        RecordGuanDanScenes.Instance.SetPutOutData();
	    RecordGuanDanScenes.Instance.SetLastPlayerOutHandCardData();
	    CurSeat.RefreshHandCard();
	    let Kind = RecordGuanDanScenes.Instance.CurUserOutCard.out_kind;
	    CurSeat.PlayCardKindEffect(Kind);
	    this.PlayOutCardAudio();
    }
    //刷新过牌
    private NotifiRefreshPassCard( Param : any )
    {
        if ( Param.detail == null ) return;
        let RoleID =  Param.detail;
        let CurSeat : UIRecordSeatsBase = this.GetSeats( RoleID )
        if ( CurSeat == null ) return;
        CurSeat.RefreshPass( true );
        CurSeat.HideCardRiver();
        //this.PlayPassCardAudio();
    }

    //刷新名次
    private NotifiRefreshBank( RankList )
    {
        this.mSeatsList.ForEach( ( item : UIRecordSeatsBase)=>
        {
            if ( item == null )return;
            let Rank = RecordGuanDanScenes.Instance.GetPlayerRank( item.BindRoleID );
            item.GetRoleInfo().ShowRank( Rank );
        });
    }

    //麻将玩家头像显示状态
    private NotifiShowStateHead( Msg : any )
    {
        let State : boolean = Msg.detail;
        this.mSeatsList.ForEach( ( item : UIRecordSeatsBase)=>
        {
            if ( item == null )return;
             item.ShowStateHead( false );
             item.ShowStateMoney( false );
			 item.ShowStateName( false );
        });

        this.mSeatsList.ForEach( ( item : UIRecordSeatsBase)=>
        {
            if ( item == null ) return;
            if ( item.GamePlayer == null ) return;
            let Player = RecordGuanDanScenes.Instance.GetRolePlayer(item.GetBindID());
            if ( Player == null ) return;
             item.ShowStateHead( State );
			 item.ShowStateMoney( State );
			 item.ShowStateName( State );
			item.GetRoleInfo().ShowTeam(Player.GetTeam());
        });

        let ProtoBuf = NetManager.GetProtobuf();
        this.mSeatsList.ForEach( ( item : UIRecordSeatsBase)=>
        {
            if ( item == null )return;
            if ( item.GamePlayer == null ) return;
            
            if ( item.GamePlayer.IsNewRole() )
            {
                let SoundMgr = AppFacade.Instance.GetSoundManager();
                SoundMgr.PlayGameSoundEffect(GameDefine.RoomType , GameDefine.JinRuFangJian );
                item.GamePlayer.RemoveRoleState( ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_NEWROLE );
            }
        });

    }

    //设置座位
    private NotifiResetGUI( Msg : any )
    {
        this.UIToolsList.RefreshRoomInfo();
    }
   
    //发送手牌
    private NotifiFirstCard()
    {
        this.mSeatsList.ForEach( ( item ) =>
        {
            let Seats : UIRecordSeatsBase = item;
            if ( Seats == null ) return;
            Seats.SetCardLayout();
        });
        this.BottomSeat.SetInitialLayout(true);
    }

    //刷新发牌状态相关
    private NotifiFirstCardState()
    {
        this.mSeatsList.ForEach( ( item : UIRecordSeatsBase ) =>
        {
            if ( item == null ) return;
            item.HideRank();
        });
    }

    //隐藏牌河
    private NotifiHideCardRiever()
    {
        this.mSeatsList.ForEach( (item : UIRecordSeatsBase)=>
        {
           item.HideCardRiver();
           item.RefreshPass( false );
        } );
    }

    //进贡还贡效果
    private NotifiPlayerSendOrRecvGift( Msg)
    {
        let GiftInfo = Msg.detail;
        let ID = GiftInfo.scr_role_id
        let GDSeat = this.GetSeats(ID);
        if( null == GDSeat )
        {
            return;
        }
        GDSeat.ShowSendGiftCardEffect(GiftInfo.send_card);
    }

    //进贡还贡完成
    private NotifiPlayerSendOrRecvGiftEnd()
    {
        let MsgGiftCardInfo = RecordGuanDanScenes.Instance.CurGiftRoomInfo;
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
        let Seat : UIRecordSeatsBase = this.GetSeats( RecordGuanDanScenes.Instance.CurrActionUser );
        if ( Seat == null )return;
        Seat.HideCardRiver();
        Seat.RefreshPass( false );
    }

    private GetSeats( ID :  number ) :UIRecordSeatsBase
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
        this.mSeatsList.ForEach( (item : UIRecordSeatsBase)=>
        {
            let Rank = RecordGuanDanScenes.Instance.GetPlayerRank( item.BindRoleID );
            item.RoleInfo.ShowRank( Rank );
        } );
    }

    //绘制牌河
    private DrawCardRiver()
    {
        let OutCardInfo = RecordGuanDanScenes.Instance.CurUserOutCard;
        if ( OutCardInfo == null ) return
        let OldRoleID   = OutCardInfo.old_actionid;
        let GDSeat : UIRecordSeatsBase = this.GetSeats( OldRoleID );
        if ( GDSeat == null )return;
        if ( Util.Equal64Num( OldRoleID, OutCardInfo.new_actionid ) )
        {
            this.mSeatsList.ForEach( ( item :UIRecordSeatsBase ) =>
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
        if( null == RecordGuanDanScenes.Instance.CurUserOutCard ) return
        let GDPlayer = RecordGuanDanScenes.Instance.GetRolePlayer( RecordGuanDanScenes.Instance.CurUserOutCard.old_actionid );
        if( null == GDPlayer) return;
        let Man :boolean = true;
        //获取性别
        let sex = HeadPoolModule.GetWxSex(GDPlayer.GetPID());
        if(null != sex)
        {
            Man = (sex == 1);
        }
        let Kind : number = RecordGuanDanScenes.Instance.CurUserOutCard.out_kind & GameDefine.GDCardTypeMask;
        let AudioName : string = this.GetOutAudioName( Kind , Man );
        AppFacade.Instance.GetSoundManager().PlayGameSoundEffect(GameDefine.RoomType , AudioName);
    }

    //获取音效名字
    private GetOutAudioName( Kind : number , Man : boolean ) : string
    {
        let ProtoBuf = NetManager.GetProtobuf();
       if( Kind ==  ProtoBuf.TGuanDanCT.CT_SINGLE)
       {
           let GDCard : GameCard = RecordGuanDanScenes.Instance.LastPlayerPutOutCars.Get(1);
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
            let GDCard :GameCard = RecordGuanDanScenes.Instance.LastPlayerPutOutCars.Get(2);
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

    // 过牌音效
    private PlayPassCardAudio()
    {

    }

    onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_HEAD   , this.NotifiRefreshHead            , this);//重置界面
        cc.systemEvent.off(EventName.EVENT_UI_REFRESH_NAME   , this.NotifiRefreshName            , this);//重置界面    
        cc.systemEvent.off("GD_RT_DA"                , this.NotifiResetGUI               , this);//重置界面
        cc.systemEvent.off("GD_SIMUL"                , this.NotifiSimulateGUI            , this);//模拟GUI
        cc.systemEvent.off("GD_BD_SS"                , this.NotifiBindSeats              , this);//座位
        cc.systemEvent.off("GD_GR_GL"                , this.NotifiGameLevel              , this);//刷新游戏级别
        cc.systemEvent.off("GD_GD_SE"                , this.NotifiScore                  , this);//刷新分数
        cc.systemEvent.off("GD_GD_TE"                , this.NotifiTeam                   , this);//刷新队伍
        cc.systemEvent.off("GD_SI_GN"                , this.NotifiDrawGiftCard           , this);//模拟进贡
        cc.systemEvent.off("GD_OTC_SE"               , this.NotifiOutCardState           , this);//用户出牌状态
        cc.systemEvent.off("GD_OT_CD"                , this.NotifiOutCard                , this);//用户出牌
        cc.systemEvent.off("GD_RN_OT"                , this.NotifiRefreshPassCard        , this);//用户过牌
        cc.systemEvent.off("GD_GU_RANK"              , this.NotifiRefreshBank            , this);//刷新名次
        cc.systemEvent.off("GD_SE_HD"                , this.NotifiShowStateHead          , this);//刷新头像
        cc.systemEvent.off("GD_FT_CD"                , this.NotifiFirstCard              , this);//发送手牌
        cc.systemEvent.off("GD_JH_RG"                , this.NotifiResistGift             , this);//抗贡效果
        cc.systemEvent.off("GD_SC_SE"                , this.NotifiFirstCardState         , this);//刷新发送手牌相关状态
        cc.systemEvent.off("GD_GH_CR"                , this.NotifiHideCardRiever         , this);//隐藏牌河
        cc.systemEvent.off("GD_JH_GG"                , this.NotifiPlayerSendOrRecvGift   , this);//刷新进贡效果
        cc.systemEvent.off("GD_JH_GF"                , this.NotifiPlayerSendOrRecvGiftEnd, this);//进贡还贡完成
        cc.systemEvent.off("GD_UR_AN"                , this.NotifiUserActionState        , this);//用户活动状态
        cc.systemEvent.off("GD_GU_SD"                , this.NotifiShowDown               , this);//结算
        cc.systemEvent.off("GD_RH_VS"                , this.NotifiHandCardVisible        , this);//刷新手牌显示状态
        cc.systemEvent.off("RE_ST"                   , this.NotifiRecordOverStopPlay        , this);//回放结束停止快进和播放按钮的响应        
    }


}

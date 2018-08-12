import Singleton from "../../Common/Function/Singleton";
import simple_state_machine from "../../Common/StateMachine/StateMachine"
import Dictionary from "../../Common/DataStruct/Dictionary";
import LinkedList from "../../Common/DataStruct/LinkedList";
import EventName from "../../Common/Event/EventName";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "./GameDefine";
import SettingModule from "../../Setting/Model/SettingModule";
import GamePlayer from "./GamePlayer";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import NetManager from "../../Common/Net/NetManager";
import GDCardUIPanel from "../View/GDCardUIPanel";
import SceneManager from "../../Scene/SceneManager";
import GameCard from "./GameCard";
import Util from "../../Utility/Util";
import ResourcesManager from "../../Framework/ResourcesManager";
import ChatModule from "./ChatModule";
import CardGrpPrompt from "./CardGrpPrompt";
import Main from "../../Main";
import AppFacade from "../../Framework/AppFacade";
import MessageModule from "../../Message/Model/MessageModule";
import HeadPoolModule from "../../HeadPool/Model/HeadPoolModule";
import MessageConfig from "../../Config/MessageConfig";
import GuanDanModule from "./GuanDanModule";
import LSModule from "../../LService/Model/LSModule";
import GameItemInteract from "./GameItemInteract";
import SlideSelect from "./SlideSelect";
import { GuanDanGamePromptOpti } from "./GuanDanGamePromptOpti";


const {ccclass, property} = cc._decorator;

@ccclass

class GuanDanScenes extends cc.Component
{
    private  mGuanDanGamePromptOpti      : GuanDanGamePromptOpti          = new GuanDanGamePromptOpti();
    private  mCardGrpPrompt              : CardGrpPrompt                   = new CardGrpPrompt();
    private  mFocusState                 : boolean                         = false;
    private  mFSM                        : simple_state_machine            = new simple_state_machine();
    private  mPlayerList                 : LinkedList                      = new LinkedList();
    private  mPlayerIDList               : LinkedList                      = new LinkedList();
    private  mCurSelectCards             : LinkedList                      = new LinkedList();                   //当前选中的所有牌
    private  mCurPutOutCards             : LinkedList                      = new LinkedList();                   //当前的出牌列表
    private  mLastPlayerPutOutCars       : LinkedList                      = new LinkedList();                   //上一次出牌？
    private  mResistKingRole             : LinkedList                      = new LinkedList();                   //抗贡抓到大王的角色列表
    private  mCurrGameCount              : number                          = 0;
    private  mCurrBankerID               : number                          = 0;
    private  mCurrRoomID                 : number                          = 0;
    private  mCurrLeaveID                : number                          = 0;
    private  mCurrActionUser             : number                          = 0;
    private  mCurrUserWIK                : number                          = 0;
    private  mCurrSelectWay              : number                          = GameDefine.SelectCardWay.SCW_SINGLE;//选择牌的方式（一张，一列）
    private  mOutCardNums                : number                          = 0;                                  //出牌的次数
    private  mJieFengID                  : number                          = 0;                                  //接风的ID
    private  mCurCardValue               : number                          = -1;                                 //当前牌型的牌值
    private  mPassCardTimes              : number                          = 0;                                  //过牌次数
    private  mGuanDanRoomData            : any                             = null;
    private  mCurUserOutCard             : any                             = null;                               //出牌
    private  mCurSeries                  : number                          = 0;                                  //当前牌级
    private  mCanStretch                 : boolean                         = true;                               //是否可以点击拉伸牌（发牌过程中不允许）
    private  mAutoPassTimer              : any                             = null;                               //过牌时间计时器
    private  mRefuseStretchTimer         : any                             = null;                               //不允许拉伸计时开始
    private  mResistTimer                : any                             = null;                               //抗供的计时器
    private  mRankingList                : any                             = null;                               //排名
    private  mCuGiftRoomRole             : any                             = null;                               //当前还供
    private  mCurStateTime               : number                          = 0;
    private  mSend_Gift_Rolecard_Info    : any                             = null;
    private  mRecv_Gift_Rolecard_Info    : any                             = null; 
    private  mCurCostID                  : number                          = 0;
    private  mCurRoomSpeKind             : number                          = 0;
    private  mCurDissRoomInfo            : any                             = null;
    private  mCurGiftRoomInfo            : any                             = null;
    private  mCurGiftRoomRole            : any                             = null;
    private  mCurrPayMode                : number                          = 0;    
    private  mCanOutCardPlayers          : number                          = 0;                                 //可出牌的人数
    private  mCurUserPassCard            : any                             = null;
    private  mCurrShowDownData           : any                             = null;                              // 结算的数据
    private  mCurrEndData                : any                             = null;                              // 大结算的数据
    private  mLastActionRole             : number                          = 0;                          

    private static _Instance : GuanDanScenes = null;
    public static get Instance()
    {
        return GuanDanScenes._Instance;
    }

    onLoad()
    {
        GuanDanScenes._Instance = this;
        ChatModule.Init();
        GameItemInteract.Init();
        this.InitFSM();
        this.LoadSelectCardWay();
        cc.systemEvent.on( "SCENE_GD_GI"                                 , this.DoRevcRoomInfo           , this  );//房间信息
        cc.systemEvent.on( "SCENE_GD_RECGAMEINFO"                        , this.DoRevcRoomInfoAgain      , this  );//重新接收房间信息
        cc.systemEvent.on( "SCENE_LR"                                    , this.RevcLeaveGame            , this  );//离开游戏
        cc.systemEvent.on( "SCENE_GD_RS_EG"                              , this.DoRevcLoadFinish         , this  );//加载场景完成
        cc.systemEvent.on( "SCENE_GD_RDY"                                , this.DoRevcUserReady          , this  );//玩家准备
        cc.systemEvent.on( "SCENE_GD_CRDY"                               , this.DoRevcUserCancelReady    , this  );//玩家取消准备
        cc.systemEvent.on( "SCENE_GD_OC"                                 , this.DoRevcOutCard            , this  );//接收玩家出牌
        cc.systemEvent.on( "SCENE_GD_PS"                                 , this.DoRevcPassCard           , this  );//过牌信息
        cc.systemEvent.on( "SCENE_GD_SD"                                 , this.DoRevcShowDown           , this  );//结算
        cc.systemEvent.on( "SCENE_GD_END"                                , this.DoRevcEnd                , this  );//大结算
        cc.systemEvent.on( "SCENE_GD_RANK"                               , this.DoRevcRoomRank           , this  );//名次信息
        cc.systemEvent.on( "SCENE_GD_RSTG"                               , this.DoRevcKangGong           , this  );//抗贡
        cc.systemEvent.on( "SCENE_GD_JF"                                 , this.DoRevcJieFeang           , this  );//接风
        cc.systemEvent.on( "SCENE_GD_NAID"                               , this.DoRevcNewActionID        , this  );//新玩家ID
        cc.systemEvent.on( "SCENE_GD_ORE"                                , this.DoRecvDissApply          , this  );//解散申请
        cc.systemEvent.on( "SCENE_GD_NRE"                                , this.DoRecvRefuseDiss         , this  );//拒绝解散
        cc.systemEvent.on( "SCENE_GD_SGR"                                , this.DoRecvEnterSendGift      , this  );//进入进贡状态
        cc.systemEvent.on( "SCENE_GD_SGF"                                , this.DoRecvSendGiftFinish     , this  );//进贡完成
        cc.systemEvent.on( "SCENE_GD_RGR"                                , this.DoRecvEnterRecvGift      , this  );//进入回贡状态
        cc.systemEvent.on( "SCENE_GD_RGF"                                , this.DoRecvRecvGiftFinish     , this  );//回贡完成
        cc.systemEvent.on( "SCENE_GD_SGC"                                , this.DoRevcLimitStartGame     , this  );//同一IP提醒
        cc.systemEvent.on( "SCENE_GD_RS"                                 , this.DORevcOfflineeState      , this  );//在离线状态
        this.InitRoomData();
    }

    onDestroy()
    {
        GameItemInteract.OnRelease();
        this.StopTimer();
        this.ReleaseEvent();
    }

    // 初始化状态机
    private InitFSM()
    {
        var fsm_param: { [key: string]: any;} = 
        {
            "events" : ["TGuanDanStateWait",                //等待
                          "TGuanDanStateCheckStartGame",    //检查开始
                          "TGuanDanStateStartGame",         //开始游戏
                          "TGuanDanStateSendFirstBrand",    //发送手牌
                          "TGuanDanStateAction",            //玩家自由活动
                          "TGuanDanStateShowdown",          //结算
                          "TGuanDanStateEnd",               //大结算
                          "TGuanDanStateOutCard",           //出牌
                          "TGuanDanStateRelieve",           //请求离开
                          "TGuanDanStateLeaveGame",         //离开
                          "TGuanDanStateSendGift",          //进贡
                          "TGuanDanStateSendGiftFinish",    //进贡完成
                          "TGuanDanStateRecvGift",          //还贡
                          "TGuanDanStateRecvGiftFinish",    //还贡完成
                          "TGuanDanStateRCSendGift",        //断线重新连接进贡
                          "TGuanDanStateRCRecvGift"         //断线重新连接还贡
                        ],
              "callbacks" : {
                "onTGuanDanStateWait"                   : this.DoGameFSMWait.bind( this ),
                "onTGuanDanStateCheckStartGame"         : this.DoGameFSMStartGame.bind( this ),
                "onTGuanDanStateStartGame"              : this.DoGameFSMCheckStartGame.bind( this ),       
                "onTGuanDanStateSendFirstBrand"         : this.DoGameFSMFirstBrand.bind( this ),
                "onTGuanDanStateAction"                 : this.DoGameFSMAction.bind( this ),
                "onTGuanDanStateShowdown"               : this.DoGameFSMShowdown.bind( this ),
                "onTGuanDanStateEnd"                    : this.DoGameFSMEnd.bind( this ),
                "onTGuanDanStateOutCard"                : this.DoGameFSMOutCard.bind( this ),
                "onTGuanDanStateRelieve"                : this.DoGameFSMRelieve.bind( this ),
                "onTGuanDanStateLeaveGame"              : this.DoGameFSMLeaveGame.bind( this ),
                "onTGuanDanStateSendGift"               : this.DoGameFSMEnterSendGift.bind( this ),
                "onTGuanDanStateSendGiftFinish"         : this.DoGameFSMSendGiftFinish.bind( this ),
                "onTGuanDanStateRecvGift"               : this.DoGameFSMEnterRecvGift.bind( this ),
                "onTGuanDanStateRecvGiftFinish"         : this.DoGameFSMRecvGiftFinish.bind( this ),
                "onTGuanDanStateRCSendGift"             : this.DoGameFSMEnterRCSendGift.bind( this ),
                "onTGuanDanStateRCRecvGift"             : this.DoGameFSMEnterRCRecvGift.bind( this ),
            }
        }
  
         this.mFSM.setup_state(fsm_param);
    }
    
    //从配置中读取选牌模式
    private LoadSelectCardWay()
    {
        let Way = SettingModule.GetGuanDanSelectCardWay();
        this.mCurrSelectWay = Way;
    }

    //获取选中牌的方式
    public GetSelectWay()
    {
        return this.mCurrSelectWay;
    }

    //获取选中牌的方式
    public SetSelectWay( Way : number )
    {
        this.mCurrSelectWay = Way;
    }

    public ClearPrivateGameData()
    {
        this.mCurrActionUser  = 0;
        this.mCurrBankerID    = 0;
        this.mCurrUserWIK     = 0;
    }

    //设置当前活动玩家ID
    private SetCurrActionUser( ID )
    {
        this.mLastActionRole = this.mCurrActionUser;
        this.mCurrActionUser = ID;
    }

    //重置房间信息;
    public ClearGameData()
    {
        this.mCurrActionUser   = 0;
        this.mCurrBankerID     = 0;
        this.mCurrGameCount    = 0;
        this.mCurrUserWIK      = 0;
        this.mPlayerList.Clear();
        this.mPlayerIDList.Clear();
    }

    public RefreshPlayerList( PlayerList )
    {
        for ( let idx = 0 ; idx < PlayerList.length; idx++ )
        {
            let Player : GamePlayer = this.GetRolePlayer( PlayerList[idx].player_base.pid );
            if ( null == Player )
            {
                Player = new GamePlayer( PlayerList[idx] );
                this.mPlayerList.Push( Player );
            }else
            {
                Player.RefreshData( PlayerList[idx] );
            }
        }
        this.RefreshPIDList( PlayerList );
    }

    // 根据ID
    public GetRolePlayer( ID : number ) : GamePlayer
    {
        for ( let idx = 1; idx <= this.mPlayerList.GetCount(); idx++ )
        {
            let Player = this.mPlayerList.Get(idx);
            if ( null != Player && Util.Equal64Num( Player.GetPID() ,ID )  )
            {
                return Player;
            }
        }
        return null;
    }

    //获取玩家ID(根据座位)
    public GetRoleID( Seats : number ) : number
    {
        for ( let idx = 1; idx <= this.mPlayerList.GetCount(); idx++ )
        {
            let Player : GamePlayer = this.mPlayerList.Get(idx);
            if ( Player.GetGameSeats() == Seats )
            {
                return Player.GetPID();
            }
        }
        return 0;
    }

    public SetJieFengID( Value : number)
    {
        return this.mJieFengID = Value;
    }

    public RefreshPIDList( PlayerList )
    {
        this.mPlayerIDList.Clear();
        for ( let idx = 0; idx < PlayerList.length; idx++ )
        {
            this.mPlayerIDList.Push( PlayerList[idx] );
        }
    }

    public RefreshHandCard( CardList : any )
    {
        let Player : GamePlayer = this.GetRolePlayer( PlayerDataModule.GetPID() );
        if ( Player == null ) return;
        Player.AddHandCardList( CardList );
    }

    //判断一个玩家的位置是否在当前活动玩家和上一次活动玩家之间
    public IsPlayerBetweenLC(RoleID)
    {
        if( this.mLastActionRole == 0 || this.CurrActionUser == 0) return false;
        if( this.mLastActionRole == this.CurrActionUser ) return false;
        if( RoleID == this.mLastActionRole ) return false;
        if( RoleID == this.mCurrActionUser) return false;
        let CurrIdx = this.GetPlayerIDIdx(this.mCurrActionUser);
        let LastIdx = this.GetPlayerIDIdx(this.mLastActionRole);
        if( CurrIdx < 0 || LastIdx < 0 ) return false;
        let RoleIdx = this.GetPlayerIDIdx( RoleID );
        if( RoleIdx < 0 ) return false;
        // 索引值为1，2，3，4
	
        //当前索引大于上一个的索引
        if( CurrIdx > LastIdx )
        {
            return RoleIdx > LastIdx && RoleIdx < CurrIdx;
        }
        else
        {
            return RoleIdx < CurrIdx || RoleIdx > LastIdx;
        }

    }

    //获取一个玩家在列表中的索引值
    private GetPlayerIDIdx(ID)
    {
        for( let i = 1 ; i < this.mPlayerList.GetCount() ; i++ )
        {
            if( this.mPlayerList.Get(i) == ID )
            {
                return i;
            }
        }
        return -1;
    }

    //不允许拉伸计时开始
    private StartRefuseStretchTimer()
    {
        this.mRefuseStretchTimer = setInterval( ()=>
        {
            this.StopRefuseStretchTimer();
            this.mCanStretch = true; 
        }, 2000);
    }

    private StopRefuseStretchTimer()
    {
        if ( null !=this.mRefuseStretchTimer )
        {
            clearInterval(this.mRefuseStretchTimer);
            this.mRefuseStretchTimer = null;
        }
    }

    public CanStretchCard()
    {
        return this.mCanStretch;
    }

    //等待
    private DoGameFSMWait( Param )
    {
        let bRefreshPlayerList : boolean = Param.msg;
        this.ClearPrivateGameData();
        if ( null != this.mGuanDanRoomData && bRefreshPlayerList )
        {
            this.RefreshPlayerList( this.mGuanDanRoomData.player_list );
        }

        cc.systemEvent.emit("GD_RT_DA" ,  true );   //重置GUI
        cc.systemEvent.emit("GD_BD_SS"         );   //更新座位
        cc.systemEvent.emit("GD_SE_HD" ,  true );   //显示头像
        cc.systemEvent.emit("GD_GD_SE"         );   //刷新分数
        cc.systemEvent.emit("GD_GD_TE"         );   //刷新队伍
        cc.systemEvent.emit("GD_WT_SE"         );   //刷新等待状态
        
    }
    //检查开始
    private DoGameFSMStartGame()
    {
    }
    //开始游戏
    private DoGameFSMCheckStartGame()
    {
    }
    //发送手牌
    private DoGameFSMFirstBrand()
    {
        this.mOutCardNums    = 0;
        this.mPassCardTimes  = 0;
        this.mCurUserOutCard = null;
        this.SetCurrActionUser( this.mGuanDanRoomData.action_id );
        this.mCurSelectCards.Clear();                                   //清空选中的牌
        this.RefreshPlayerList( this.mGuanDanRoomData.player_list );    //刷新玩家列表
        this.RefreshHandCard( this.mGuanDanRoomData.hand_card );        //刷新手牌
        this.mCurSeries     = this.mGuanDanRoomData.series;				//刷新当前级别
        cc.systemEvent.emit("GD_SE_SE" );                               //更新开始状态
        cc.systemEvent.emit("GD_BD_SS" );                               //更新座位
        cc.systemEvent.emit("GD_GD_TE" );                               //更新队伍
        cc.systemEvent.emit("GD_FT_CD" );                               //发送手牌
        cc.systemEvent.emit("GD_SC_SE" );                               //更新状态
        cc.systemEvent.emit("GD_SS_CT" ,true  );                        //显示中心指示
        cc.systemEvent.emit("GD_ST_CE" ,false );                        //权限
        cc.systemEvent.emit("GD_GR_GL" );                               //级别
        cc.systemEvent.emit("GD_GH_CR" );                               //隐藏牌河
        cc.systemEvent.emit("GD_SE_HD" ,true );                        //显示头像
        cc.systemEvent.emit("GD_RE_TSH" );                              //刷新同花顺按钮显示
        cc.systemEvent.emit("GD_HIDE_ROLE_GIFT" );                      //隐藏所有角色贡信息
        this.mCanStretch = false;
        this.StartRefuseStretchTimer();
    }
    //玩家自由活动
    private DoGameFSMAction()
    {
        cc.systemEvent.emit("GD_UR_AN");                            //用户活动状态
        this.UpdateCardPrompt();
        cc.systemEvent.emit("GD_ST_CE" , null );                    //用户选择权限
        cc.systemEvent.emit("GD_GD_SE");                            //刷新分数
        cc.systemEvent.emit("GD_TM_CT" , this.GetCenterHitTime() ); //刷新中心提示时间
        cc.systemEvent.emit("GD_RF_CT");                            //更新中心提示方向
        this.SetAutoPass();
    }

    //结算
    private DoGameFSMShowdown()
    {
        let ProtoBuf  = NetManager.GetProtobuf();
        cc.systemEvent.emit("GD_GU_SD");                            //结算
        cc.systemEvent.emit("GD_GD_SE");                            //刷新分数

        let OpenSowDown =  setTimeout(() => {
            clearTimeout(OpenSowDown);
            if ( this.CheckSpecial( ProtoBuf.TGameGuanDanSpecial.TGDSK_JDWF) )
            {
                UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_SHOWDOWN );
            }else if ( this.CheckSpecial( ProtoBuf.TGameGuanDanSpecial.TGDSK_TTZWF) )
            {
                UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_SHOWDOWNSCORE );
            }
        }, 1000);

        cc.systemEvent.emit("GD_HIDE_ROLE_GIFT");                   //隐藏所有角色贡信息
    }
    //大结算
    private DoGameFSMEnd()
    {
        UIManager.DestroyUI(  GameDefine.GameUIConfig.UI_ROOMRECORD.type );
        UIManager.DestroyUI(  GameDefine.GameUIConfig.UI_DISSOLVEROOM.type );
        let OpenEnd =  setTimeout(() => {
            clearTimeout(OpenEnd);
            UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_PRIVATESHOWDOWN );
        }, 1000);
    }

    //出牌
    private DoGameFSMOutCard()
    {
        let Player : GamePlayer = this.GetRolePlayer( this.mCurrActionUser );
        if ( null == Player )return;
        this.mOutCardNums += 1;
        this.mCurSelectCards.Clear();                           //清空选中的牌
        Player.SetHandNum( this.mCurUserOutCard.hand_count );   //刷新手牌数
        cc.systemEvent.emit("GD_OTC_SE");                       //刷新出牌状态
        cc.systemEvent.emit("GD_OT_CD");                        //用户出牌
        cc.systemEvent.emit("GD_RF_SC");                        //刷新剩余牌数
        if ( Util.Equal64Num( this.mCurrActionUser , PlayerDataModule.GetPID() ))
        {
            cc.systemEvent.emit("GD_RE_TSH");                    //刷新同花顺显示
        }
    }
    //请求离开
    private DoGameFSMRelieve()
    {
        let ProtoBuf  = NetManager.GetProtobuf();
        for ( let i = 0; i < this.mCurDissRoomInfo.agree_role_list.length; i++ )
        {
            let PID = this.mCurDissRoomInfo.agree_role_list[i];
            let Player = this.GetRolePlayer( PID );
            if ( Player == null ) continue;
            Player.AddRoleState( ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_APPLY_DISS );
        }
        
        let UI = UIManager.GetUI( GameDefine.GameUIConfig.UI_DISSOLVEROOM.type );
        if ( UI==null )
        {
            UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_DISSOLVEROOM );
        }
        cc.systemEvent.emit("GD_DI_SS" , this.mCurStateTime );
    }
    //离开
    private DoGameFSMLeaveGame()
    {
        if ( Util.Equal64Num(this.mCurrLeaveID , PlayerDataModule.GetPID() ) )
        {
            this.LeaveGame();
        }else
        {
            for ( let i = 1; this.mPlayerList.GetCount(); i++ )
            {
                if( Util.Equal64Num( this.mPlayerList.Get(i).GetPID() , this.mCurrLeaveID ) )
                {
                    this.mPlayerList.RemoveByIndex( i );
                    break;
                }
            }
            this.ClearPrivateGameData();
            this.mFSM.do_event("TGuanDanStateWait" ,{  msg: false } );
        }
    }
    
    //判断进入进贡状态后，是否需要显示功能按钮（不需要进贡可以显示）
    private SendGiftStateShowFunBtns()
    {
        let SendGift = false;
        for ( let i = 0; i < this.mCurGiftRoomRole.send_info.length; i++ )
        {
            if (  Util.Equal64Num( this.mCurGiftRoomRole.send_info[i].role_id , PlayerDataModule.GetPID() ) && parseInt(this.mCurGiftRoomRole.send_info[i].is_complete) == 0 )
                {
                    SendGift = true;
                }
        }
        return !SendGift;
    }

    //判断进入还贡状态后，是否需要显示功能按钮（不需要还贡可以显示）
    private RevcGiftStateShowFunBtns()
    {
        let SendGift = false;
        for ( let i = 0; i < this.mCurGiftRoomRole.recv_info.length; i++ )
        {
            if ( Util.Equal64Num( this.mCurGiftRoomRole.recv_info[i].role_id , PlayerDataModule.GetPID() )
                && parseInt(this.mCurGiftRoomRole.recv_info[i].is_complete)  == 0 )
                {
                    SendGift = true;
                }
        }
        return !SendGift;
    }

    //判断自己是否要进贡
    private CheckSelfNeedSendGiftCard()
    {   
        for (let i = 0; i < this.mCurGiftRoomRole.send_info.length; i++)
        {
            if( Util.Equal64Num( this.mCurGiftRoomRole.send_info[i].role_id , PlayerDataModule.GetPID() ) && this.mCurGiftRoomRole.send_info[i].is_complete == 0 )
            {
                cc.systemEvent.emit( "GD_GJ_GS" , true );
            }
        }
    }

    //判断自己是否要还贡
    private CheckSelfNeedRecvGiftCard()
    {
        for (let i = 0; i < this.mCurGiftRoomRole.recv_info.length; i++)
        {
            if( Util.Equal64Num( this.mCurGiftRoomRole.recv_info[i].role_id , PlayerDataModule.GetPID() ) && this.mCurGiftRoomRole.recv_info[i].is_complete == 0 )
            {
                cc.systemEvent.emit("GD_GH_GS" , true);
            }
        }
    }

    //进贡
    private DoGameFSMEnterSendGift( Param )
    {
        cc.systemEvent.emit("GD_GJ_GS" , false);                    //隐藏进贡权限
        cc.systemEvent.emit("GD_GH_GS" , false);                    //隐藏还贡权限
        cc.systemEvent.emit("GD_ST_CE" , false);                    //隐藏用户权限
        let ShowFunBtns = this.SendGiftStateShowFunBtns();
        cc.systemEvent.emit("GD_GM_FS" , ShowFunBtns);              //功能按钮
        if (  Param == null ) return; 
        if ( Param.msg )
        {
            cc.systemEvent.emit( "GD_JH_GG" );                      //贡牌飞出
            let id = this.mGuanDanRoomData.gift_card.scr_role_id;
            if ( !Util.Equal64Num( id , PlayerDataModule.GetPID() ) )
            {
                this.CheckSelfNeedSendGiftCard();
            }
        }
        else
        {
            this.CheckSelfNeedSendGiftCard();
        }
    }

    //进贡完成
    private DoGameFSMSendGiftFinish()
    {
        cc.systemEvent.emit("GD_JH_GF");                    //贡牌回手
        let ShowFunBtns = this.SendGiftStateShowFunBtns();
        cc.systemEvent.emit("GD_GJ_GS", ShowFunBtns );      //隐藏进贡权限
    }

    //还供
    private DoGameFSMEnterRecvGift( Param )
    {
        cc.systemEvent.emit("GD_GJ_GS" , false);                    //隐藏进贡权限
        cc.systemEvent.emit("GD_GH_GS" , false);                    //隐藏还贡权限
        cc.systemEvent.emit("GD_ST_CE" , false);                    //隐藏用户权限
        let RecvGift = this.RevcGiftStateShowFunBtns();
        cc.systemEvent.emit("GD_GM_FS" , RecvGift);                 //功能按钮
        if (  Param == null ) return; 
        if ( Param.msg )
        {
            cc.systemEvent.emit( "GD_JH_GG" );                      //贡牌飞出
            let id = this.mGuanDanRoomData.gift_card.scr_role_id;
            if (  !Util.Equal64Num( id , PlayerDataModule.GetPID() ) )
            {
                this.CheckSelfNeedRecvGiftCard();
            }
        }
        else
        {
            this.CheckSelfNeedRecvGiftCard();
        }
    }

    //还供完成
    private DoGameFSMRecvGiftFinish()
    {  
        cc.systemEvent.emit("GD_JH_GF"                 );    //贡牌回手
        cc.systemEvent.emit("GD_ST_CE"          , false);    //隐藏权限
        cc.systemEvent.emit("GD_GM_FS"          , true );    //显示功能按钮
        cc.systemEvent.emit("GD_GH_GS"          , false);    //隐藏还贡权限
        cc.systemEvent.emit("GD_RE_TSH"                );    //刷新同花顺按钮显示
        cc.systemEvent.emit("GD_SHOW_ROLE_GIFT" , false);    //显示角色的贡牌信息
    }

    //断线重新连接进贡
    private DoGameFSMEnterRCSendGift( Param )
    {
        cc.systemEvent.emit("GD_GJ_GS" , false);                    //隐藏进贡权限
        cc.systemEvent.emit("GD_GH_GS" , false);                    //隐藏还贡权限
        cc.systemEvent.emit("GD_ST_CE" , false);                    //隐藏用户权限
        let ShowFunBtns = this.SendGiftStateShowFunBtns();
        cc.systemEvent.emit("GD_GM_FS" , ShowFunBtns);              //功能按钮
        cc.systemEvent.emit("GD_BD_SS"        );                    //更新座位
        cc.systemEvent.emit("GD_SE_HD" , true );                    //显示头像
        cc.systemEvent.emit("GD_TM_SEND_GIFT_CT" , this.GetGiftCenterTime());//显示进贡角色
        if (  Param == null ) return; 
        if ( Param.msg )
        {
            let id = this.mGuanDanRoomData.gift_card.scr_role_id;
            if (  !Util.Equal64Num( id , PlayerDataModule.GetPID() ) )
            {
                this.CheckSelfNeedSendGiftCard();
            }
        }
        else
        {
            this.CheckSelfNeedSendGiftCard();
        }
    }

    //重置房间信息;
    private ResetGuanDanRoomData()
    {
        this.mGuanDanRoomData = null;
    }

    //断线重新连接还贡
    private DoGameFSMEnterRCRecvGift( Param )
    {
        cc.systemEvent.emit("GD_GJ_GS" , false);                    //隐藏进贡权限
        cc.systemEvent.emit("GD_GH_GS" , false);                    //隐藏还贡权限
        cc.systemEvent.emit("GD_ST_CE" , false);                    //隐藏用户权限
        let RecvGift = this.RevcGiftStateShowFunBtns();
        cc.systemEvent.emit("GD_GM_FS" , RecvGift);                 //功能按钮
        cc.systemEvent.emit("GD_BD_SS"        );                    //更新座位
        cc.systemEvent.emit("GD_SE_HD" , true );                    //显示头像
        cc.systemEvent.emit("GD_TM_RECV_GIFT_CT" ,  this.GetGiftCenterTime());//显示进贡角色
        if (  Param == null ) return; 
        if ( Param.msg )
        {
            let id = this.mGuanDanRoomData.gift_card.scr_role_id;
            if (  !Util.Equal64Num( id , PlayerDataModule.GetPID() ) )
            {
                this.CheckSelfNeedRecvGiftCard();
            }
        }
        else
        {
            this.CheckSelfNeedRecvGiftCard();
        }
    }
    //房间信息
    public DoRevcRoomInfo()
    {
        this.InitRoomData();
        if ( null == this.mGuanDanRoomData ) return;
        let ProtoBuf  = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateWait )
        {
            this.mFSM.do_event("TGuanDanStateWait", { msg : true });
        }else if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateStartGame )
        {
            this.mFSM.do_event("TGuanDanStateStartGame");
        }else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateSendFirstCard )
        {
            this.mFSM.do_event("TGuanDanStateSendFirstBrand");
        }
        else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateSendGift )
        {
            this.mFSM.do_event("TGuanDanStateSendGift" , { msg : true });
        }
        else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateRecvGift )
        {
            this.mFSM.do_event("TGuanDanStateRecvGift", { msg : true });
        }
    }

    // 初始化房间信息
    private InitRoomData()
    {
        this.mGuanDanRoomData = GuanDanModule.GuanDanRoomData;
        if ( null == this.mGuanDanRoomData ) return;
        // 启动定位
	    LSModule.StartLocationService();
        this.ClearGameData();
        this.RefreshPlayerList( this.mGuanDanRoomData.player_list );
        this.RefreshHandCard( this.mGuanDanRoomData.hand_card );
        this.mSend_Gift_Rolecard_Info = this.mGuanDanRoomData.send_gift_rolecard_info;
        this.mRecv_Gift_Rolecard_Info = this.mGuanDanRoomData.recv_gift_rolecard_info;
        this.mRankingList             = this.mGuanDanRoomData.room_ranking.rank_list;
        this.mCuGiftRoomRole          = this.mGuanDanRoomData.gift_role_info;
        this.mCurStateTime            = this.mGuanDanRoomData.state_time;
        this.mOutCardNums             = this.mGuanDanRoomData.out_card_nums;
        this.mCurrRoomID 		      = this.mGuanDanRoomData.room_id;
	    this.mJieFengID			      = this.mGuanDanRoomData.jiefeng_id;
	    this.mCurrActionUser	      = this.mGuanDanRoomData.action_id;
	    this.mCurrUserWIK		      = this.mGuanDanRoomData.wik;
	    this.mCurSeries		          = this.mGuanDanRoomData.series;
	    this.mCurrGameCount		      = this.mGuanDanRoomData.game_count;
	    this.mCurCostID			      = this.mGuanDanRoomData.cost_id;
	    this.mCurRoomSpeKind	      = this.mGuanDanRoomData.room_special_kind;
	    this.mCurDissRoomInfo         = this.mGuanDanRoomData.diss_room_info;
	    this.mCurGiftRoomInfo	      = this.mGuanDanRoomData.gift_card;
	    this.mCurGiftRoomRole 	      = this.mGuanDanRoomData.gift_role_info;
	    this.mCurUserOutCard	      = this.mGuanDanRoomData.last_out_card_info;
	    this.mRankingList		      = this.mGuanDanRoomData.room_ranking.rank_list;
	    this.mCurStateTime		      = this.mGuanDanRoomData.state_time;
	    this.mCurrPayMode		      = this.mGuanDanRoomData.room_pay_type;
    }

    //重新接收房间信息
    private DoRevcRoomInfoAgain()
    {
        this.InitRoomData();
        if ( null == this.mGuanDanRoomData ) return;
        let ProtoBuf  = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateWait )
        {
            this.mFSM.do_event("TGuanDanStateWait", { msg : true });
        }else if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateStartGame )
        {
            this.mFSM.do_event("TGuanDanStateStartGame");
        }else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateSendFirstCard )
        {
            this.mFSM.do_event("TGuanDanStateSendFirstBrand");
        }
        else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateSendGift )
        {
            this.mFSM.do_event("TGuanDanStateRCSendGift" , { msg : true });
        }
        else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateRecvGift )
        {
            this.mFSM.do_event("TGuanDanStateRCRecvGift", { msg : true });
        }
        else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuandanStateRelieveRoom )
        {
            this.mFSM.do_event("TGuandanStateRelieve");
        }
        else if( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateAction )
        {
            cc.systemEvent.emit("GD_SIMUL" ); //模拟GUI
            this.mFSM.do_event("TGuanDanStateAction");
        }
    }
    //离开游戏
    private RevcLeaveGame( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.mCurrLeaveID = Msg.value;
        this.mFSM.do_event("TGuanDanStateLeaveGame");
    }

    //加载资源完成
    private DoRevcLoadFinish()
    {
        cc.systemEvent.emit("GD_RT_DA", false ); //重置UI
        if ( false == this.IsPlayGame() )
        {
            this.mFSM.do_event("TGuanDanStateWait", { msg :true } );
        }else
        {
            cc.systemEvent.emit("GD_SIMUL"); //模拟GUI
            if ( this.IsGiftCardState() )
            {
                cc.systemEvent.emit( "GD_SI_GN",false );
            }
            if ( this.IsRelieveState() )
            {
                this.mFSM.do_event("TGuanDanStateRelieve");
            }
        }
    }

    //玩家准备
    private DoRevcUserReady( Param )
    {
        if ( !this.IsWaitState() )
        {
            return;
        }
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        cc.systemEvent.emit( "GD_GUI_UR" , Msg.value ); //模拟GUI
    }

    //玩家取消准备
    private DoRevcUserCancelReady( Param )
    {
        if ( !this.IsWaitState() )
        {
            return;
        }
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        cc.systemEvent.emit( "GD_GUI_UCR" , Msg.value ); //模拟GUI
    }

    //获取自己是否是当前活动玩家
    public SelfIsCurActionUser()
    {
        return this.mCurrActionUser == PlayerDataModule.GetPID();
    }

    //获取上次出牌信息
    public GetLastOutCardInfo()
    {
        if( null == this.mGuanDanGamePromptOpti ) return [ null , null ];

        return this.mGuanDanGamePromptOpti.GetLastOutCardInfo();
    }

    //接收玩家出牌
    private DoRevcOutCard( Param )
    {
        if ( Param.detail == null )return;
        let OutCard =  Param.detail;
        this.SetCurrActionUser(OutCard.old_actionid);
        this.mCurUserOutCard = OutCard;
        this.mFSM.do_event("TGuanDanStateOutCard");
        this.mCurrUserWIK = this.mCurUserOutCard.wik;
        this.SetCurrActionUser( OutCard.new_actionid );
        this.mCanOutCardPlayers = OutCard.can_outcard_num;
        this.mFSM.do_event("TGuanDanStateAction");
        this.mJieFengID = 0;
        this.mPassCardTimes = 0;
    }

    //过牌信息
    private DoRevcPassCard( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        let MainPlayer = this.GetRolePlayer( Msg.old_actionid );
	    if ( null == MainPlayer ) return;
        this.mCurUserPassCard = Msg;
        this.mCurrUserWIK     = Msg.wik;
        this.mCurrActionUser  = Msg.new_actionid;
        this.mJieFengID       = Msg.jf_role_id;
        this.mPassCardTimes++;

        this.mFSM.do_event("TGuanDanStateAction");
        cc.systemEvent.emit("GD_RN_OT" ,Msg.old_actionid);
        if ( this.mPassCardTimes >= this.mCanOutCardPlayers )
        {
            this.mPassCardTimes = 0;
            cc.systemEvent.emit("GD_GH_CR");
        }
        if ( !Util.Num64Is0(this.mJieFengID) )
        {
            cc.systemEvent.emit("GD_PJFE");
        }
    }

    //结算
    private DoRevcShowDown( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.mCurrShowDownData = Msg;
        this.mCurrGameCount    = Msg.game_count;
        this.mRankingList      = Msg.room_ranking.rank_list;
        this.mFSM.do_event("TGuanDanStateShowdown");
        if ( Msg.relieve_state != 1 )
        {
            cc.systemEvent.emit("GD_GU_RANK");
        }
        this.RefreshPlayerScore( Msg.win_role );
        this.RefreshPlayerScore( Msg.lost_role );
    }
    
    //大结算
    private DoRevcEnd( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.mCurrEndData      = Msg;
        this.mCurrGameCount    = Msg.game_count;
        this.RefreshPlayerScore( Msg.win_role );
        this.RefreshPlayerScore( Msg.lost_role );
        this.mFSM.do_event("TGuanDanStateEnd");
    }

    //名次信息
    private DoRevcRoomRank( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.mRankingList = Msg.rank_list;
        cc.systemEvent.emit("GD_GU_RANK");
    }

    //抗贡
    private DoRevcKangGong( Param )
    {
        cc.systemEvent.emit("GD_KG");
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        for ( let i = 0; i < Msg.kingcard_role_list.length; i++ )
        {
            this.mResistKingRole.Push( Msg.kingcard_role_list[i] );
        }
        this.ShowResistKingCard();
    }

    //接风
    private DoRevcJieFeang( Stream )
    {

    }

    //新玩家ID
    private DoRevcNewActionID( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.SetCurrActionUser( Msg.new_actionid ) ;
	    this.mCurrUserWIK    = Msg.wik;
        this.mJieFengID      = Msg.jf_role_id;
        this.mFSM.do_event("TGuanDanStateAction");
    }

    //解散申请
    private DoRecvDissApply( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        for ( let i = 0; i < Msg.role_state.length; i++ )
        {
            let MsgRoleSate = Msg.role_state[i];
            let GDPlayer = this.GetRolePlayer( MsgRoleSate.role_id );
            if ( GDPlayer == null ) continue;
            GDPlayer.RefreshRoleState( MsgRoleSate.state );
        }

        let UI = UIManager.GetUI( GameDefine.GameUIConfig.UI_DISSOLVEROOM.type );
        if ( UI != null )
        {
            cc.systemEvent.emit("GD_DI_SS");
        }else
        {
            UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_DISSOLVEROOM );
        }
    }

    //拒绝解散
    private DoRecvRefuseDiss( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        let ProtoBuf = NetManager.GetProtobuf();
        this.PlayerList.ForEach( ( Itme : GamePlayer ) => {
            Itme.RemoveRoleState(ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_APPLY_DISS);
        } )
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_DISSOLVEROOM.type);

        let Player = this.GetRolePlayer( Msg.value);
        if( Player == null) return;
        let WXName = HeadPoolModule.GetWxName( Player.GetUserName(), Player.GetPID() );
        if( WXName == undefined ) WXName = "";
        MessageModule.ShowMessageStr( cc.js.formatStr( MessageConfig.GetMessage(52), WXName ) );
    }

    //进入进贡状态
    private DoRecvEnterSendGift( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        let ProtoBuf = NetManager.GetProtobuf();
        this.mCurGiftRoomRole = Msg;
        if( null != this.GuanDanRoomData )
        {
            this.GuanDanRoomData.room_state = ProtoBuf.TGuanDanState.TGuanDanStateSendGift;
        }
        this.mFSM.do_event("TGuanDanStateSendGift" , { msg : false });
        cc.systemEvent.emit( "GD_TM_SEND_GIFT_CT" , GameDefine.CenterGiftTime );
    }

    //进贡完成
    private DoRecvSendGiftFinish( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.mCurGiftRoomInfo = Msg.gift_card;
        this.mFSM.do_event("TGuanDanStateSendGiftFinish");
    }

    //进入回贡状态
    private DoRecvEnterRecvGift( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        let ProtoBuf = NetManager.GetProtobuf();
        this.mCurGiftRoomRole = Msg;
        if( null != this.mGuanDanRoomData)
        {
            this.GuanDanRoomData.room_state = ProtoBuf.TGuanDanState.TGuanDanStateRecvGift
        }
        this.mFSM.do_event( "TGuanDanStateRecvGift" , { msg : false } );
        cc.systemEvent.emit( "GD_TM_RECV_GIFT_CT" , GameDefine.CenterGiftTime);
    }
    //回贡完成
    private DoRecvRecvGiftFinish( Param )
    {
        if ( Param.detail == null )return;
        let Msg =  Param.detail;
        this.mCurGiftRoomInfo = Msg.gift_card;
        this.mFSM.do_event("TGuanDanStateRecvGiftFinish");
    }
    //同一IP提醒
    private DoRevcLimitStartGame( Stream )
    {
    }
    //在离线状态
    private DORevcOfflineeState( Stream )
    {

    }

    //是否在游戏中
    private IsPlayGame() : boolean
    {
        if ( null == this.mGuanDanRoomData )
        {
            return false;
        }
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateWait
        || this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateCheckStartGame
        || this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateShowDown )
        {
             return false;
        }

        return true;
    }

    // 是否是进贡或者还贡状态
    private IsGiftCardState() : boolean
    {
        if ( null == this.mGuanDanRoomData )
        {
            return false;
        }
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateSendGift
        || this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateRecvGift )
        {
             return true;
        }

        return false;
    }

    // 是否是进贡状态
    public IsSendGiftState() : boolean
    {
        if ( null == this.mGuanDanRoomData )
        {
            return false;
        }
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateSendGift )
        {
             return true;
        }

        return false;
    }

    // 是否是回贡状态
    public IsRevcGiftState() : boolean
    {
        if ( null == this.mGuanDanRoomData )
        {
            return false;
        }
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuanDanStateRecvGift )
        {
             return true;
        }

        return false;
    }
    
    // 是否可过牌
    public IsCanPass() : boolean
    {
        return this.mCurrUserWIK == 1;
    }

    // 是否是请求解散状态
    private IsRelieveState() : boolean
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mGuanDanRoomData.room_state == ProtoBuf.TGuanDanState.TGuandanStateRelieveRoom )
        {
             return true;
        }

        return false;
    }

    //自动过牌逻辑
    public AutoPass( AutoPassTime : number )
    {
        this.StopAutoPassTimer();
        if ( Util.Equal64Num(this.mCurrActionUser, PlayerDataModule.GetPID()) )
        {
            return;
        }
        if ( !this.IsCanPass() )
        {
            return;
        }

        if ( this.mGuanDanGamePromptOpti.GetPromptList().GetCount() > 0 )
        {
            return;
        }
        if ( this.mAutoPassTimer == null )
        {
            this.mAutoPassTimer = setInterval(() => {
                clearInterval( this.mAutoPassTimer );
                this.mAutoPassTimer = null;
            }, 1000);
        }
    }

    //过牌
    public SendPass()
    {
        NetManager.SendMessage( "GD_PS" );
        this.StopAutoPassTimer();
    }

    //停止自动过牌计时
    private StopAutoPassTimer()
    {
        if ( null != this.mAutoPassTimer )
        {
            clearInterval( this.mAutoPassTimer );
            this.mAutoPassTimer = null;
        } 
    }

    //添加一个选中的牌
    public AddSelectedCard( GDCard : GDCardUIPanel )
    {
        if ( ! this.mCurSelectCards.Contain( GDCard) )
        {
            this.mCurSelectCards.Push( GDCard );
        }
    }

    //继续下一局
    public SendContinueGame()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = new ProtoBuf.MsgString();
        Msg.str = "GD_XJ";
        NetManager.SendMessage( "GD_CG" ,  Msg );
    }

    // 删除一个选中的牌
    public RemoveSelectedCard( GDCard : GDCardUIPanel )
    {
        this.mCurSelectCards.RemoveOneByValue( GDCard );
    }
    // 请求准备
    public SendUserReady()
    {
        NetManager.SendMessage( "GD_RDY" );
    }

    // 获取下一个座位
    public GetNextSeats( Seats : number ) : number
    {
        if (Seats== null) return;
        Seats += 1;
        if ( Seats <= 3 )
        {
            return Seats;
        }
        return 0;
    }

    //获取玩家的排名
    public GetPlayerRank( RoleID : number ) : number
    {
        for ( let i = 0; i < this.mRankingList.length; i++ )
        {
            if ( Util.Equal64Num( RoleID, this.mRankingList[i] ))
            {
                return i;
            }
        }
        return -1;
    }

    //是否开始游戏
    public IsStartGame() : boolean 
    {
        if ( this.mGuanDanRoomData.room_state != 0 ) return true;
        if ( this.mCurrGameCount > 0 ) return true;
        return false;
    }

    //获取自己队友的ID
    public GetTeammateID(): number 
    {
        let Player : GamePlayer = this.GetRolePlayer( PlayerDataModule.GetPID() );
        if ( Player == null ) return 0;
        let SelfTeam = Player.GetTeam();
        for ( let i = 1; i <= this.mPlayerList.GetCount(); i++ )
        {
            let Ply : GamePlayer = this.mPlayerList.Get(i);
            if ( Ply == null ) continue;
            if ( Ply.GetTeam() == SelfTeam && Ply != Player )
            {
                return Ply.GetPID();
            }
        }

        return 0;
    }

    //牌排序(GameCard)
    public SortCardList( CardList : LinkedList )
    {
        CardList.Sort(( a : GameCard , b : GameCard )=>
        {
            let aLogicValue = this.GetGDCardLogicValue( a.Card );
            let bLogicValue = this.GetGDCardLogicValue( b.Card );
            return aLogicValue == bLogicValue ? a.Index > b.Index : aLogicValue > bLogicValue; 
        });
    }

    public GetGDCardLogicValue( CardValue : number ) : number
    {
        let Color = GameDefine.GetCardColor( CardValue ); 
        let Value = GameDefine.GetCardValue( CardValue ); 
        if ( Color == 0x40 )
        {
            return Value + 15;
        }
        
        let CurSeriesValue = GameDefine.GetCardValue( this.mCurSeries );
        if ( Value == CurSeriesValue ) return 15;
        if ( Value == 1) return 14;

        return Value;
    }

    //获取当前是否可以自由出牌
    public IsFreeOutCard() : boolean
    {
        return this.GuanDanGamePromptOpti.IsFreeOutCard();
    }

    //获取角色是否是抗贡抓到大王的
    public IsResistKingRole( RoleID : number ) : boolean
    {
        for ( let i = 1; i <= this.mResistKingRole.GetCount(); i++ )
        {
            if ( Util.Equal64Num(RoleID ,this.mResistKingRole.Get( i ) ))
            {
                return true;
            }
        }
        return false;
    }

    //获取自己的手牌数量
    public GetMainPlayerCardNums() :number
    {
        let MainPlayer = this.GetRolePlayer(PlayerDataModule.GetPID());
	    if (null == MainPlayer) return 0;

	    return MainPlayer.GetHandCardCount();
    }

    //刷新出牌列表
    public SetPutOutData()
    {
        this.mCurPutOutCards.Clear();
        if ( Util.Equal64Num (this.mCurrActionUser , PlayerDataModule.GetPID()) )
        {
            for ( let i = 0; i < this.mCurUserOutCard.out_card.length; i++ )
            {
                let GDCardInfo = new GameCard( this.mCurUserOutCard.out_card[i].card );
                GDCardInfo.Index = this.mCurUserOutCard.out_card[i].index;
                if ( GDCardInfo == null ) continue;
                this.mCurPutOutCards.Push( GDCardInfo );
            }
        }
    }

    //刷新记录上一次出牌
    public SetLastPlayerOutHandCardData()
    { 
        this.mLastPlayerPutOutCars.Clear();
        for ( let i = 0; i < this.mCurUserOutCard.out_card.length; i++ )
        {
            let GDCardInfo = new GameCard( this.mCurUserOutCard.out_card[i].card );
            GDCardInfo.Index = this.mCurUserOutCard.out_card[i].index;
            if ( GDCardInfo == null ) continue;
            this.mLastPlayerPutOutCars.Push( GDCardInfo );
        }
    }

    //获取Action中心倒计时时间
    public GetActionCenterTime() : number
    {
        let Second     = Math.floor( this.mCurStateTime / 1000 );
        let CenterTime = this.GetCenterHitTime() - Second;
        return CenterTime > 0 ? CenterTime : 0; 
    }

    public GetGiftCenterTime() : number
    {
        let Second     = Math.floor( this.mCurStateTime / 1000 );
        let CenterTime = GameDefine.CenterGiftTime - Second;
        return CenterTime > 0 ? CenterTime : 0; 
    }

    //判断主玩家是否处于进贡或者还贡状态
    public IsSelfGiftState()
    {
        if ( this.IsSendGiftState() )
        {
            let SendInfo = this.mCurGiftRoomRole.send_info;
            if ( SendInfo != null )
            {
                for ( let i = 0; i < SendInfo.length; i++ )
                {
                    if (  Util.Equal64Num( PlayerDataModule.GetPID() , SendInfo[i].role_id )&& SendInfo[i].is_complete == 0 )
                    { return true; }
                }
            }
        }

        if ( this.IsRevcGiftState() )
        {
            let RevcInfo = this.mCurGiftRoomRole.recv_info
            if ( RevcInfo != null )
            {
                for ( let i = 0; i < RevcInfo.length; i++ )
                {
                    if (  Util.Equal64Num( PlayerDataModule.GetPID() , RevcInfo[i].role_id ) && RevcInfo[i].is_complete == 0 )
                    { return true; }
                }
            }
        }

        return false;
    }

    //获取中心提示时间
    private GetCenterHitTime()
    {
        return 0 == this.mOutCardNums ? 50 : GameDefine.CenterHitTime;
    }

    // 请求离开房间
    public SendRequestRelieveRoom( State : boolean )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg  = new ProtoBuf.MsgBool();
        Msg.val  = State;
        NetManager.SendMessage( "GD_RE", Msg );
    }

    //获取抗贡抓到王牌的角色列表
    public GetResistKingRole()
    {
        return this.mResistKingRole;
    }

    //出牌
    public SendOutCard( OutCardList : LinkedList )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let Msg = new ProtoBuf.MsgUserOutCard();
        OutCardList.ForEach( (GDCard : GameCard)=>
        {
            if ( GDCard == null ) return;
            let MsgCardInfo = new ProtoBuf.MsgCardInfo();
            MsgCardInfo.card  = GDCard.Card;
            MsgCardInfo.index = GDCard.Index;
            Msg.out_card.push( MsgCardInfo );
        });
        NetManager.SendMessage( "GD_OC", Msg );
        this.StopAutoPassTimer();
    }

    //请求进贡
    public SendUserSendGift()
    {
        if( null == this.mCurSelectCards) return;
        if( 1 != this.CurSelectCards.GetCount() )
        {
            MessageModule.ShowMessage(1001);
            return;
        }
        let GDCard :GameCard = this.mCurSelectCards.Get(1).mCardInfo;
        let ProtoBuf = NetManager.GetProtobuf();
        let MsgCardInfo = new ProtoBuf.MsgCardInfo();
        MsgCardInfo.card = GDCard.Card;
        MsgCardInfo.index = GDCard.Index;
        NetManager.SendMessage( "GD_SG", MsgCardInfo );
    }

    //请求还贡
    public SendUserRecvGift()
    {
        if( null == this.mCurSelectCards ) return;
        if( 1 != this.mCurSelectCards.GetCount() )
        {
            MessageModule.ShowMessage(1001);
            return;
        }
        let GDCard : GameCard = this.mCurSelectCards.Get(1).mCardInfo;
        let ProtoBuf = NetManager.GetProtobuf();
        let MsgCardInfo = new ProtoBuf.MsgCardInfo();
        MsgCardInfo.card = GDCard.Card;
        MsgCardInfo.index = GDCard.Index;
        NetManager.SendMessage( "GD_RG", MsgCardInfo );
    }

    // /设置自动过牌
    private SetAutoPass()
    {
        if ( Util.Equal64Num(  PlayerDataModule.GetPID(), this.mCurrActionUser ) ) return;
        let MainPlayer = this.GetRolePlayer( PlayerDataModule.GetPID() );
        if ( null == MainPlayer ) return;
        let MianPlayerHandCardCount = MainPlayer.GetHandCardCount();
        let AutoPassTime = 0.0;
        MianPlayerHandCardCount <= 4 ? AutoPassTime = 1.0 : AutoPassTime = Math.floor( Math.random()*3 + 2);
        this.AutoPass( AutoPassTime );
    }

    // /更新玩家出牌提示
    public UpdateCardPrompt()
    {
        // /只有主玩家需要提示
        if ( !Util.Equal64Num( this.mCurrActionUser , PlayerDataModule.GetPID() ) )
        {
            return;
        }
        let CardKind = 0;
        if ( null != this.mCurUserOutCard )
        {
            CardKind = this.CurUserOutCard.out_kind;
            if ( Util.Equal64Num( this.CurUserOutCard.old_actionid , PlayerDataModule.GetPID()) || this.CurUserOutCard.old_actionid == 0  )
            {
                CardKind = 0;
            }
            if ( this.mJieFengID != null && Util.Equal64Num( this.mJieFengID , this.mCurrActionUser ))
            {
                CardKind = 0;
            }
        }
        if ( CardKind == 0 )
        {
            this.GuanDanGamePromptOpti.ResetOutCardInfo();
            this.CardGrpPrompt.ResetOutCardInfo()
        }else
        {
            this.GuanDanGamePromptOpti.UpdateOutCardInfo(this.CurUserOutCard.out_kind );
            this.CardGrpPrompt.UpdateOutCardInfo( this.CurUserOutCard.out_kind );
        }
        this.GuanDanGamePromptOpti.Prompt();
    }

    //是否是等待状态
    private IsWaitState()
    {
        return this.mFSM.curr_state() == "TGuanDanStateWait";
    }

    //检查特殊玩法;
    public CheckSpecial( BitMark : number ) : boolean
    {
        BitMark = 1 << BitMark
        if( this.mCurRoomSpeKind & BitMark )
            return true;
        else
            return false;
    }

    //刷新玩家成绩
    //结算时用
    private RefreshPlayerScore( MsgSDlist : any )
    {
        for ( let i = 0; i < MsgSDlist.length; i++ )
        {
            let GDPlayer = this.GetRolePlayer( MsgSDlist[i].role_id );
            if ( GDPlayer == null ) continue;
            GDPlayer.SetScore( MsgSDlist[i].score );
            GDPlayer.SetTotalScore( MsgSDlist[i].current_score );
        }
    }

    //显示抗贡大王牌
    private ShowResistKingCard()
    {
        this.StopResistTimer();
        if ( null == this.mResistTimer )
        {
            this.mResistTimer = setInterval(() => {
                this.StopResistTimer();
                cc.systemEvent.emit("GD_SH_RE_KING" , false );
            }, 3.0 );
        }
        cc.systemEvent.emit("GD_SH_RE_KING" , true );
    }

    //停止抗贡计时
    private StopResistTimer()
    {
        if ( null != this.mResistTimer )
        {
            clearInterval(this.mResistTimer);
            this.mResistTimer = null;
        }
    }

    ///////////////////////////////牌型相关////////////////////////////////

    //是否是有效的牌
    private IsValidCard( CardData : GameCard )
    {
        let Color = GameDefine.GetCardColor( CardData );
        let Value = GameDefine.GetCardValue( CardData );
        if( Color <= 0x40 && Value >= 0x1 && Value <= 0xD)
        {
            return true;
        }
        return false;
    }

    //是否是同花顺
    //手牌列表
    // AMax	A是否为最大的，如果是true a == 14，如果是false a == 1
    private IsTSHType( CardList : LinkedList, AMax :boolean )
    {
        let SeriesNums = 0;
        let CardListClone = new LinkedList();
        CardList.ForEach( ( item :GameCard ) => {
            if( item.Card != this.mCurSeries )
            {
                CardListClone.Push(item)
            }
            else
            {
                SeriesNums++;
            }
        } )

        CardListClone.Sort( (a : GameCard , b : GameCard ) => {
            let aLogicValue = GameDefine.GetCardValue(a.Card);
            let bLogicValue = GameDefine.GetCardValue(b.Card);
            if( AMax && aLogicValue == 1)
            {
                aLogicValue = 14;
            }
            if( AMax && bLogicValue == 1 )
            {
                bLogicValue = 14;
            }
            return aLogicValue > bLogicValue;
        } )

        let FirstValue = CardListClone.Get(1).Value;
        if( AMax && FirstValue == 1 )
        {
            FirstValue = 14;
        }

        CardListClone.ForEach( ( item :GameCard ) => {
            if(item == CardListClone.Get(1)) return;
            let NextValue = item.Value;
            if( NextValue == FirstValue - 1 )               //中间没有间断
            {
                FirstValue = NextValue;
            }
            else if( NextValue == FirstValue - 2 )          //中间隔了一个
            {
                if( SeriesNums > 0 )
                {
                    SeriesNums--;
                    FirstValue = NextValue;
                }
                else
                {
                    return false;
                }
            }
            else if( NextValue == FirstValue - 3 )          //中间隔了两个
            {
                if( SeriesNums > 1 )
                {
                    SeriesNums = SeriesNums - 2;
                    FirstValue = NextValue;
                }
                else                                        
                {
                    return false;
                }
            }
            else
            {
                return false;                               //中间隔了两个以上，不可能组成同花顺
            }
        } )

        return true;
        
    }

    //是否是四王炸弹
    private IsFourKing( GDCardInfoList : LinkedList )
    {
        if( null == GDCardInfoList || GDCardInfoList.GetCount() != 4 )
        {
            return false;
        }
        for( let i = 1 ; i <= GDCardInfoList.GetCount() ; i++ )
        {
            if( GDCardInfoList.Get(i).Color != 0x40 )
            {
                return false;
            }
        }
        return true;
    }

    //判断是几张牌的炸弹
    private BombCount( GDCardInfoList : LinkedList )
    {
        if( null == GDCardInfoList || GDCardInfoList.GetCount() == 0 ) return 0;

        let bFirstValue = 0;
        let bNextValue = 0;
        bFirstValue = GDCardInfoList.Get(1).Card;
        if( bFirstValue == 0x40 ) return 0;

        let bRedSeries = 0;
        let i = 1;
        while( i <= GDCardInfoList.GetCount() && GDCardInfoList.Get(i).Card == this.mCurSeries )
        {
            i++;
            bRedSeries++;
        }
        bFirstValue = GDCardInfoList.Get(i).Value;
        let IdxStart = i + 1;
        let BombNums = bRedSeries + 1;

        for( let j = IdxStart ; j <= GDCardInfoList.GetCount() ; j++)
        {
            bNextValue = GDCardInfoList.Get(j).Value;
            if( bNextValue == bFirstValue )
            {
                BombNums++;
            }
            else
            {
                return 0;
            }
        }

        return BombNums;
    }

    //是否是同花顺，重写
    private IsTongHuaShunEx( GDCardInfoList :LinkedList )
    {
        if( null == GDCardInfoList ) return false;
        if( 5 != GDCardInfoList.GetCount() ) return false;
        //判断是否有王牌
        GDCardInfoList.ForEach( ( item : GameCard ) => {
            if( 0x40 == item.Color) return false;
        } )
        //花色判断排除
        let TempColor = -1;
        let ColorNums = 0;
        GDCardInfoList.ForEach( ( item : GameCard ) => {
            if( item.Card != this.CurSeries )
            {
                if( TempColor != item.Color )
                {
                    TempColor = item.Color;
                    ColorNums = ColorNums + 1; 
                }
            }
        } )
        if( ColorNums > 1 ) return false;

        if( this.IsTSHType(GDCardInfoList , true) ) return true;
        
        if( this.IsTSHType(GDCardInfoList , false) ) return true;

        return false;
    }


    //判断一副牌是否是炸弹
    public IsBoomCards( GDCardInfoList :LinkedList )
    {
        if( null == GDCardInfoList || GDCardInfoList.GetCount() < 4 )
        {
            return false;
        }

        if( this.IsFourKing(GDCardInfoList) )
        {
            return true;
        }

        if( this.IsTongHuaShunEx(GDCardInfoList) )
        {
            return true;
        }

        if( this.BombCount(GDCardInfoList) >=4 )
        {
            return true;
        }
        return false;
    }

    public LeaveGame()
    {
        AppFacade.Instance.GetSoundManager().StopBackGroundMusic();
        SceneManager.LoadScene("Hall");
    }

    private ReleaseEvent()
    {
        cc.systemEvent.off( "SCENE_GD_GI"                                 , this.DoRevcRoomInfo           , this  );//房间信息
        cc.systemEvent.off( "SCENE_GD_RECGAMEINFO"                        , this.DoRevcRoomInfoAgain      , this  );//重新接收房间信息
        cc.systemEvent.off( "SCENE_LR"                                    , this.RevcLeaveGame            , this  );//离开游戏
        cc.systemEvent.off( "SCENE_GD_RS_EG"                              , this.DoRevcLoadFinish         , this  );//加载场景完成
        cc.systemEvent.off( "SCENE_GD_RDY"                                , this.DoRevcUserReady          , this  );//玩家准备
        cc.systemEvent.off( "SCENE_GD_CRDY"                               , this.DoRevcUserCancelReady    , this  );//玩家取消准备
        cc.systemEvent.off( "SCENE_GD_OC"                                 , this.DoRevcOutCard            , this  );//接收玩家出牌
        cc.systemEvent.off( "SCENE_GD_PS"                                 , this.DoRevcPassCard           , this  );//过牌信息
        cc.systemEvent.off( "SCENE_GD_SD"                                 , this.DoRevcShowDown           , this  );//结算
        cc.systemEvent.off( "SCENE_GD_END"                                , this.DoRevcEnd                , this  );//大结算
        cc.systemEvent.off( "SCENE_GD_RANK"                               , this.DoRevcRoomRank           , this  );//名次信息
        cc.systemEvent.off( "SCENE_GD_RSTG"                               , this.DoRevcKangGong           , this  );//抗贡
        cc.systemEvent.off( "SCENE_GD_JF"                                 , this.DoRevcJieFeang           , this  );//接风
        cc.systemEvent.off( "SCENE_GD_NAID"                               , this.DoRevcNewActionID        , this  );//新玩家ID
        cc.systemEvent.off( "SCENE_GD_ORE"                                , this.DoRecvDissApply          , this  );//解散申请
        cc.systemEvent.off( "SCENE_GD_NRE"                                , this.DoRecvRefuseDiss         , this  );//拒绝解散
        cc.systemEvent.off( "SCENE_GD_SGR"                                , this.DoRecvEnterSendGift      , this  );//进入进贡状态
        cc.systemEvent.off( "SCENE_GD_SGF"                                , this.DoRecvSendGiftFinish     , this  );//进贡完成
        cc.systemEvent.off( "SCENE_GD_RGR"                                , this.DoRecvEnterRecvGift      , this  );//进入回贡状态
        cc.systemEvent.off( "SCENE_GD_RGF"                                , this.DoRecvRecvGiftFinish     , this  );//回贡完成
        cc.systemEvent.off( "SCENE_GD_SGC"                                , this.DoRevcLimitStartGame     , this  );//同一IP提醒
        cc.systemEvent.off( "SCENE_GD_RS"                                 , this.DORevcOfflineeState      , this  );//在离线状态
    }

    private StopTimer()
    {
        this.StopAutoPassTimer();
        this.StopRefuseStretchTimer();
        this.StopResistTimer();
    }

    public get CurrActionUser()         : number                { return this.mCurrActionUser;         }
    public get CurrGameCount()          : number                { return this.mCurrGameCount;          }
    public get CurrBankerID()           : number                { return this.mCurrBankerID;           }
    public get CurrRoomID()             : number                { return this.mCurrRoomID;             }
    public get CurrUserWIK()            : number                { return this.mCurrUserWIK;            }
    public get CurSeries()              : number                { return this.mCurSeries;              }
    public get CurSelectCards()         : LinkedList            { return this.mCurSelectCards;         }
    public get CurPutOutCards()         : LinkedList            { return this.mCurPutOutCards;         }
    public get LastPlayerPutOutCars()   : LinkedList            { return this.mLastPlayerPutOutCars;   }
    public get PlayerList()             : LinkedList            { return this.mPlayerList;             }
    public get PlayerIDList()           : LinkedList            { return this.mPlayerIDList;             }
    public get CurUserOutCard()         : any                   { return this.mCurUserOutCard;         }
    public get GuanDanRoomData()        : any                   { return this.mGuanDanRoomData;        }
    public get CardGrpPrompt()          : CardGrpPrompt         { return this.mCardGrpPrompt;          }    
    public get GuanDanGamePromptOpti()  : GuanDanGamePromptOpti { return this.mGuanDanGamePromptOpti;  }
    public get CurUserPassCard()        : any                   { return this.mCurUserPassCard;         }
    public get CurrShowDownData()       : any                   { return this.mCurrShowDownData;       }
    public get JieFengID()              : number                { return this.mJieFengID;              }
    public get CurrSelectWay()          : number                { return this.mCurrSelectWay;          }
    public get CurGiftRoomRole()        : any                   { return this.mCurGiftRoomRole;        }
    public get Send_Gift_Rolecard_Info(): any                   { return this.mSend_Gift_Rolecard_Info;}
    public get Recv_Gift_Rolecard_Info(): any                   { return this.mRecv_Gift_Rolecard_Info;}
    public get CurrEndData()            : any                   { return this.mCurrEndData;            }
    public get CurGiftRoomInfo()        : any                   { return this.mCurGiftRoomInfo;        }
    public get CurCostID()			    : number                { return this.mCurCostID;              }
    public get CurPayMode()			    : number                { return this.mCurrPayMode;            }
}

export default GuanDanScenes;
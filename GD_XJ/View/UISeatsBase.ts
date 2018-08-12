import GamePlayer from "../Module/GamePlayer";
import UIRoleInfo from "./UIRoleInfo";
import GuanDanCardLayout from "./GuanDanCardLayout";
import LinkedList from "../../Common/DataStruct/LinkedList";
import GuanDanScenes from "../Module/GuanDanScenes";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";
import GameCard from "../Module/GameCard";
import GDCardUIPanel from "./GDCardUIPanel";
import GameDefine from "../Module/GameDefine";
import GDHandCardGroup from "./GDHandCardGroup";
import NetManager from "../../Common/Net/NetManager";
import UIUserPact from "../../Login/View/UIUserPact";
import ResourcesManager from "../../Framework/ResourcesManager";
import UIBase from "../../Common/UI/UIBase";
import Util from "../../Utility/Util";
import SoundManager from "../../Sound/SoundManager";
import AppFacade from "../../Framework/AppFacade";
import UIManager from "../../Common/UI/UIManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class UISeatsBase extends UIBase
{
    private mGamePlayer : GamePlayer        = null;
    @property(cc.Node)
    RiverCardParent : cc.Node               = null;
    @property(cc.Node)
    HandCardParent  : cc.Node               = null;
    @property(UIRoleInfo)
    RoleInfo        : UIRoleInfo            = null;
    @property(cc.Node)
    SendPosition    : cc.Node               = null;
    @property( cc.Node)
    ImagePass       : cc.Node               = null; //过
    @property( cc.Node)
    EffectParent    : cc.Node               = null; //特效父物体
    

    private mCardLayout             : GuanDanCardLayout = null;
    private mRiverCardList          : LinkedList        = new LinkedList(); //初始化牌河
    private mHandCardList           : LinkedList        = new LinkedList(); //初始化手牌
    private mHandCardGrpList        : LinkedList        = new LinkedList(); //手牌组列表
    private mKingCardList           : LinkedList        = new LinkedList(); //大王牌列表（最多2个，抗贡的时候显示用）
    private mBindRoleID             : number            = 0;                //ID
    private mBindSeats              : number            = 0;                //座位
    private mRiverIndex             : number            = 1;
    private mCoroutineParam         : number            = 0;
    private mGiftCardList           : GDCardUIPanel[]   = [];             //贡牌
    
    onLoad ()
    {
        this.InitRiver();
    }

    start () 
    {
    }

    private InitRiver()
    {
        this.mRiverCardList.Clear();
        for ( let i = 1; i <= 10; i++ )
        {
            let Path = GameDefine.PrefabPath + "GuanDanHandCardMiddle";
            let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.RiverCardParent );
            if( Obj == null ) return;
            let GDCard : GDCardUIPanel  = Obj.getComponent( "GDCardUIPanel" );
            if ( GDCard == null ) return;
            GDCard.SetVisible( false );
            this.mRiverCardList.Push( GDCard );
        }
    }

    //获取玩家信息
    public GetRoleInfo() : UIRoleInfo
    {
        return this.RoleInfo;
    }

    //绑定ID
    public SetBindID( ID : number )
    {
        this.mBindRoleID = ID;
        this.InitSeats();
    }

    //获取绑定ID
    public GetBindID() :number
    {
        return this.mBindRoleID;
    }

    //绑定角色位置
    public SetBindSeats( Seats : number )
    {
        this.mBindSeats = Seats;
    }

    //获取角色位置
    public GetBindSeats():number
    {
        return this.mBindSeats;
    }

    // /初始化手牌位置到发牌点仅Bottom需要，所以说Bottom重写
    public InitHandCardPosition( i : number , Num : number , CardPanel : GDCardUIPanel )
    {
    }

    //布局手牌位置并移动到目标位置;
    //Bottom重写
    public LayoutHandCards()
    {
    }

    // 子类重写
    public SetCardLayout()
    {
    }

    public SetInitialLayout( Deal : boolean )
    {
        if ( this.mGamePlayer == null ) return;
        this.mGamePlayer.RefreshHandCardIndex();
        //排序
        GuanDanScenes.Instance.SortCardList( this.mGamePlayer.HandCardList );
        //删除所有手牌实例
        this.ClearHandCards();
        //删除所有组
        this.ClearGroup();
        //创建手牌(掼蛋中仅有主玩家需要手牌列表)
        this.InitialAllHandCards();
        //重置Group
        this.ResetHandCardGroup( this.mGamePlayer.HandCardList );
        //布局手牌并移动到目标位置
        this.mHandCardList.ForEach( ( item ) =>
        {
            let GDCardUI : GDCardUIPanel = item;
            GDCardUI.SetImageDepth();
        });

        this.LayoutHandCards();
        Deal ? this.DealCard() : this.SetAllHandCardsMove(0);
    }

    //设置所有手牌移动
    public DealCard()
    {
        this.ResetCardSelectState();
        this.SetAllHandsCardsLayoutInfo();
        let delatime = 0.04;
        let movetime = 0.1;
        this.mHandCardList.ForEach( ( item ) =>
        {
            let GDCardUI : GDCardUIPanel = item;
            GDCardUI.AddTPosition( movetime , delatime );
        });
    }

    //移动所有手牌
    public SetAllHandCardsMove( Time )
    {
        this.mHandCardList.ForEach( ( item ) =>
        {
            let GDCardUI : GDCardUIPanel = item;
            GDCardUI.AddTPosition( Time , 0 );
        });
        this.ResetCardSelectState();
        this.SetAllHandsCardsLayoutInfo();
    }

    //取消所有手牌选中
    private ResetCardSelectState()
    {
        this.mHandCardList.ForEach( ( item ) =>
        {
            let GDCardUI : GDCardUIPanel = item;
            GDCardUI.SetSelected( false );
        });
    }
  
    private SetAllHandsCardsLayoutInfo()
    {
        for ( let idx = 1; idx <= this.mHandCardGrpList.GetCount(); idx++ )
        {
            let Group : GDHandCardGroup = this.mHandCardGrpList.Get( idx );
            Group.SetAllHandCardsLayoutInfo( idx );
        }
    }

    // 刷新过
    public RefreshPass( State : boolean )
    {   
        this.ImagePass.active = State;
    }

    //隐藏牌河
    public HideCardRiver()
    {
        this.mRiverCardList.ForEach( ( item : GDCardUIPanel)=>
        {
            if ( item == null )return;
            item.SetVisible( false );
        });
    }


    //初始化座位
    private InitSeats()
    {
        let Player : GamePlayer = GuanDanScenes.Instance.GetRolePlayer( this.mBindRoleID );
        if ( null == Player ) return; 
        this.mGamePlayer = Player;
        //玩家点击头像按钮
        //-----

    }

    public GetBeforeGroupCarsNums( Grp : GDHandCardGroup )
    {
        if ( null == Grp ) return 0;
        let Nums = 0;
        for ( let i = 1; i <= this.mHandCardGrpList.GetCount(); i++ )
        {
            let _grp : GDHandCardGroup = this.mHandCardGrpList.Get( i );
            if ( Grp != _grp )
            {
                Nums = Nums + _grp.GetCardNums();
            }else
            {
                break;
            }
        }
        return Nums;
    }

    // bottom 重写
    public ClearMakeColumnCard()
    {  
    }

    // 显示头像状态;
    public ShowStateHead( State : boolean )
    {
        if( this.RoleInfo == null) return;
        this.RoleInfo.node.active = State;
        this.RoleInfo.ShowHead( this.mBindRoleID );
    }

    // 刷新用户金钱;
    public ShowStateMoney( State : boolean )
    {
        if( null == this.RoleInfo ) return;
        this.RoleInfo.node.active = State;
        this.RoleInfo.ShowMoney( this.mBindRoleID );
    }

    // 刷新用户名称;
    public ShowStateName(  State : boolean )
    {
        if( null == this.RoleInfo ) return;
        this.RoleInfo.node.active = State;
        this.RoleInfo.ShowName( this.BindRoleID);
    }

    // 刷新新玩家
    public ShowNewPlayer()
    {
        if(this.mGamePlayer != null && this.mGamePlayer.IsNewRole() )
        {
            let SoundMgr = AppFacade.Instance.GetSoundManager();
            SoundMgr.PlayGameSoundEffect(GameDefine.RoomType , GameDefine.JinRuFangJian );
            let ProtoBuf = NetManager.GetProtobuf();
            this.mGamePlayer.RemoveRoleState( parseInt( ProtoBuf.TGuanDanRoleState.STATE_GUANDAN_NEWROLE ) );
        }

    }

    public ShowRemainCardNums()
    {
        if( null == this.mGamePlayer ) return;
        this.RoleInfo.RefreshRemainCard(this.GamePlayer.GetHandNum());
    }

    public HideRank()
    {
        if( null == this.RoleInfo ) return;
        this.RoleInfo.HideRank();
    }

    // 播放贡牌从玩家位置飞到牌桌中间的效果
    public ShowSendGiftCardEffect( MsgCardInfo )
    {
        let Idx = -1;
        for ( let i = 0 ; i < this.mGiftCardList.length  ; i++ )
        {
            if( this.mGiftCardList[i].GetVisible() == false )
            {
                Idx = i;
                break;
            }
        } 
        if( Idx < 0 )
        {
            return;
        }
        let GDCardInfo = new GameCard( MsgCardInfo.card );
        let GDCardUI : GDCardUIPanel = this.mGiftCardList[Idx];
        GDCardUI.SetCardInfo( GDCardInfo );
        GDCardUI.SetVisible( false );
        GDCardUI.GetCardInfo().Index = MsgCardInfo.index;
        GDCardUI.SetSendCardID(this.GetBindID());
        let VFrom = this.GetGiftCardFromPos();
        if(VFrom == new cc.Vec2(0 , 0)) return;
        GDCardUI.node.setPosition( VFrom );
        let VTo = this.GetGiftCardToPos( Idx );
        let Action = cc.moveTo( 0.2 , VTo );
        GDCardUI.node.stopAllActions()
        GDCardUI.SetVisible(true);        
        GDCardUI.node.runAction(Action);
        //显示贡牌标志
        GDCardUI.SetGiftCardFlag(true);
    }

    //获取贡牌开始位置
    private GetGiftCardFromPos()
    {
        if (this.mBindSeats == GameDefine.GameSeats[1])		        // Bottom
            return new cc.Vec2(0 , 10);
        else if (this.mBindSeats == GameDefine.GameSeats[2])  	// Right
            return new cc.Vec2(580 , 53);
        else if (this.mBindSeats == GameDefine.GameSeats[3]) 	// Top
            return new cc.Vec2(0 , 258);
        else if (this.mBindSeats == GameDefine.GameSeats[4]) 	// LEFT
            return new cc.Vec2(-580 , 53);
        else
            return new cc.Vec2(0 , 0);
    }

    //获取贡牌结束位置
    public GetGiftCardToPos( Idx : number)
    {
        if( Idx == 0 )
        {
            return new cc.Vec2( -100 , 80 );
        }
        else if( Idx == 1 )
        {
            return new cc.Vec2( 100 , 80 );
        }
        else
        {
            return new cc.Vec2( -100 , 80 );
        }
    }

    //播放贡牌从牌桌飞向玩家效果
    public ShowRecvGiftCardEffect()
    {
        let MsgCardInfo = GuanDanScenes.Instance.CurGiftRoomInfo.send_card;
        if( null == MsgCardInfo ) return;
        let Idx = -1;
        for (let i = 0; i < this.mGiftCardList.length; i++) {
            let GDCardUI = this.mGiftCardList[i];
            if( GDCardUI.GetVisible() && Util.Equal64Num( GDCardUI.GetSendCardID() , GuanDanScenes.Instance.CurGiftRoomInfo.scr_role_id ) && GDCardUI.GetCardInfo().Index == MsgCardInfo.index && GDCardUI.GetCardInfo().Card == MsgCardInfo.card)
            {
                Idx = i;
                break;
            }
        }
        if( Idx < 0 )
        {
            return;
        }

        let GDGiftCardUI : GDCardUIPanel = this.mGiftCardList[Idx];
        let VTo = this.GetGiftCardFromPos();
        let Action = cc.moveTo( 0.2 , VTo );
        GDGiftCardUI.node.stopAllActions()
        GDGiftCardUI.node.runAction(Action);
        GDGiftCardUI.SetGiftCardFlag(false);
        this.mCoroutineParam = Idx;
        this.scheduleOnce( this.WaitHideGiftCard , 0.2 );
    }

    private WaitHideGiftCard()
    {
        this.mGiftCardList[this.mCoroutineParam].SetVisible(false);
    }

    //删除所有手牌实例
    public ClearHandCards()
    {
        this.mHandCardList.ForEach( ( item ) =>
        {
            let Card : GDCardUIPanel = item;
            if ( Card == null ) return;
            Card.node.destroy();
        });

        this.mHandCardList.Clear();
    }
    //删除所有组
    public ClearGroup()
    {
        this.mHandCardGrpList.ForEach( ( item ) =>
        {
            let Grp : GDHandCardGroup = item;
            if ( Grp == null ) return;
            Grp.ClearCards();
        });

        this.mHandCardGrpList.Clear();
    }

    //重置Group
    public ResetHandCardGroup ( CardInfoList : LinkedList )
    {
        if ( null == CardInfoList || CardInfoList.GetCount() == 0 )return;
        this.ClearGroup();
        let FirstCardInfo  : GameCard = CardInfoList.Get( 1 );
        let FirstCardValue : number = FirstCardInfo.Value;
        if ( FirstCardInfo.Color == 0x40 ){ FirstCardValue += 13; }
        let NewGrp :GDHandCardGroup = new  GDHandCardGroup();
        this.AddNewGroup( NewGrp , false );
        for ( let i = 1; i <= CardInfoList.GetCount(); i++ )
        {
            let CardInfo : GameCard = CardInfoList.Get(i);
            let TmpValue = 0;
            if ( CardInfo.Color == 0x40 )
            {
                TmpValue = CardInfo.Value + 13;
            }else
            {
                TmpValue = CardInfo.Value;
            }

            if ( FirstCardValue != TmpValue )
            {
                let  NewGroup : GDHandCardGroup =  new GDHandCardGroup();
                this.AddNewGroup( NewGroup,false );
                FirstCardValue = TmpValue;
            }
            let GDUIPanel = this.FindGDCardUIByIndex( CardInfo.Index );
            if ( null == GDUIPanel ) { GDUIPanel = this.FindGDCardUIByCardValue(CardInfo.Card); }
            if ( null != GDUIPanel )
            {
                let LastGrp : GDHandCardGroup  = this.mHandCardGrpList.Get( this.mHandCardGrpList.GetCount() );
                if ( null != LastGrp )
                {
                    LastGrp.AddCard(GDUIPanel);
                }
            }
        }
        this.SortAllGroupCardByColor();
    }

    //通过CardInfo.Index查找GDCardUI
    public FindGDCardUIByIndex( Index : number ) : GDCardUIPanel
    {
        for ( let i = 1 ; i <= this.mHandCardList.GetCount(); i++ )
        {
            let HandCard :GDCardUIPanel = this.mHandCardList.Get(i);
            if ( HandCard.GetCardInfo().Index == Index )
            {
                return HandCard;
            }
        }
        return null;
    }

    //通过CardInfo._Card查找GDCardUI
    public FindGDCardUIByCardValue( Card : number ) : GDCardUIPanel
    {
        for ( let i = 1 ; i <= this.mHandCardList.GetCount(); i++ )
        {
            let HandCard :GDCardUIPanel = this.mHandCardList.Get(i);
            if ( HandCard.GetCardInfo().Card == Card )
            {
                return HandCard;
            }
        }
        return null;
    }

    //添加一个组
    private AddNewGroup( Grp : GDHandCardGroup , InsertFirst : boolean)
    {
        if ( null == Grp ) return;
        Grp.GDSeat = this;
        InsertFirst ? this.mHandCardGrpList.Insert(  1 , Grp ) : this.mHandCardGrpList.Push( Grp );
    }

    //创建手牌(掼蛋中仅有主玩家需要手牌列表)
    private InitialAllHandCards()
    {
        if ( this.GamePlayer == null ) return;
        if ( this.HandCardParent == null ) return;
        let HandCardNums = this.GamePlayer.GetHandNum();
        for ( let idx = 1 ; idx <= HandCardNums ; idx ++ )
        {
            let CardInfo : GameCard = this.GamePlayer.GetHandCard(idx);
            if ( CardInfo == null ) continue;
            CardInfo.Index = idx;   
            // 创建一个手牌
            let GDCard = this.CreateHandCardInst( CardInfo );
            this.InitHandCardPosition(idx, HandCardNums, GDCard);
        }  
    }

    public CreateHandCardInst( CardInfo : GameCard  ) : GDCardUIPanel
    {
        let Path = GameDefine.PrefabPath + "GuanDanHandCardSmall";
        let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.HandCardParent );
        if( Obj == null ) return;
        let GDCard : GDCardUIPanel  = Obj.getComponent( "GDCardUIPanel" );
        if ( GDCard == null )return;
        GDCard.SetCardInfo( CardInfo );
        this.mHandCardList.Push( GDCard );
        return GDCard;
    }

    // 刷新手牌
    // BOTTOM重写
    public RefreshHandCard()
    {
        this.OutCardToCardRiverEffect( GuanDanScenes.Instance.LastPlayerPutOutCars );
    }

    //出牌到牌河的效果
    public OutCardToCardRiverEffect( CardList : LinkedList ) 
    {
        this.RiverCardParent.setPosition( this.GetRiverInitPos() );
        this.WaitOutCardToCardRiver();
    }

    // 获取牌河初始位置
    // 各个子类重写
    public GetRiverInitPos()
    {
        return cc.Vec2.ZERO;
    }

    // 获取牌河最终位置
    // 各个子类重写
    public GetRiverEndPos() : cc.Vec2
    {
        return cc.Vec2.ZERO;
    }

    //获取手牌
    public GetHandCard( MsgCardInfo )
    {
        for (let i = 1; i <= this.HandCardList.GetCount(); i++) 
        {
            if(this.HandCardList.Get(i).GetCardInfo().Index == MsgCardInfo.index && this.HandCardList.Get(i).GetCardInfo().Card == MsgCardInfo.card)
            {
                return this.HandCardList.Get(i);
            }
            return null;
        }
    }

    //设置牌河数据 使用MsgCardInfo列表
    public SetCardRiver( CardInfoList ) : number
    {
        if ( null == CardInfoList ) return;
        this.ResetRiverCard();
        let Count = 0;
        if ( CardInfoList.length < this.mRiverCardList.GetCount() )
        {
            Count = CardInfoList.length;
        }else
        {
            Count = this.mRiverCardList.GetCount();
        }
        
        let TempList = new LinkedList();
        for ( let i = 0; i < CardInfoList.length; i++ )
        {
            let gc = new GameCard( CardInfoList[i].card );
            if ( gc == null ) continue;
            TempList.Push( gc ); 
        }
        this.RiverCardSortSet( Count, TempList );
        this.RiverCardParent.setPosition(  this.GetRiverEndPos() );
        for ( let i = 1; i <= Count; i++ )
        {
            this.mRiverCardList.Get(i).node.setPosition( new cc.Vec2( this.CalCardRiverPosX( Count , i ) ) );
        }
        
        return Count;
    }

    //出牌到牌河
    //Bottom重写
    public WaitOutCardToCardRiver()
    {
        let lGDCardInfoList = GuanDanScenes.Instance.LastPlayerPutOutCars;
        let Count = this.SetCardRiver2( lGDCardInfoList );
        let Time_1 = 0.1;
        let Pos_1 : cc.Vec2 = this.GetRiverEndPos();
        let moveto = cc.moveTo( Time_1  , Pos_1 );
        let fun = cc.callFunc(()=>
        {
            if ( Count > 1 )
            {
                let time_2 = 0.1;
                for ( let i = 1; i <= Count; i++ )
                {
                    let x = this.CalCardRiverPosX( Count , i );
                    let vPos = new cc.Vec2(x,0);
                    let move = cc.moveTo( time_2 , vPos );
                    let Card : GDCardUIPanel = this.mRiverCardList.Get(i);
                    if ( Card == null ) continue;
                    Card.node.runAction( move );
                }
            }
        });
        this.RiverCardParent.runAction( cc.sequence( moveto, fun ) );
    }

    // 设置牌河数据
    // 使用GameCard列表
    private SetCardRiver2( CardInfoList : LinkedList )
    {
        if ( null == CardInfoList ) return 0;
        this.ResetRiverCard();
        let Count = 0;
        if ( CardInfoList.GetCount() < this.mRiverCardList.GetCount() )
        {
            Count = CardInfoList.GetCount();
        }else
        {
            Count = this.mRiverCardList.GetCount();
        }
        this.RiverCardSortSet( Count , CardInfoList );
        return Count;
    }

    //计算牌河第二阶段每个牌的本地X坐标
    private CalCardRiverPosX( Count:number, Idx: number )
    {
        let CardWidth = 74;			// 牌的宽度
	    let XSpace = -40;		    // 牌之间的间隙

	    let TotalWidth = CardWidth * Count + XSpace * (Count - 1);		// 总的宽度
    	let XLeft = - TotalWidth / 2;		// 最左侧位置
	    // 因为手牌的prefab是居中对齐的，所以这里最后在 + CardWidth / 2.0;
	    let XRet = XLeft + (Idx - 1) * (CardWidth + XSpace) + CardWidth / 2.0;
	
	    return XRet;    
    }

    //重置牌河;
    private ResetRiverCard()
    {
        this.mRiverIndex = 1;
        this.RiverCardList.ForEach( ( item : GDCardUIPanel ) =>
        {
            if ( item == null) return;
            item.SetVisible( false );
            item.ResetPosition();
        });
    }

    // 取消所有选中的牌
    public CancelCardSelect()
    {
        this.HandCardGrpList.ForEach( (item:GDHandCardGroup)=>
        {
            item.CancelSelect();
        } );
    }

    //牌河排序 
    private RiverCardSortSet( Count : number , CardInfoList : LinkedList )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        //上次出牌类型
        let Kind = GuanDanScenes.Instance.CurUserOutCard.out_kind;

        let OutType = Kind & 0xFF;
        let OutVlaue = Kind >> 8;
        if ( OutType == ProtoBuf.TGuanDanCT.CT_HU_LU )                  { this.RiverCardHuLuSort( OutVlaue , Count , CardInfoList        ); }
        else if ( OutType == ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN )     { this.RiverCardShunZiSort( OutVlaue , Count , CardInfoList      ); }
        else if ( OutType == ProtoBuf.TGuanDanCT.CT_SHUN_ZI )           { this.RiverCardShunZiSort( OutVlaue , Count , CardInfoList      ); }
        else if ( OutType == ProtoBuf.TGuanDanCT.CT_LIANG_LIAN_DUI )    { this.RiverCardLiangLianDuiSort( OutVlaue , Count , CardInfoList); }
        else if ( OutType == ProtoBuf.TGuanDanCT.CT_GANG_BAN )          { this.RiverCardGangBanSort( OutVlaue , Count , CardInfoList     ); }
        else
        {
            for( let i = 1; i <= Count; i++ )
            {
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( CardInfoList.Get(i) );
                RiverCard.SetVisible( true );
            }
        }
    }

    //三带二排序
    private RiverCardHuLuSort( OutValue : number , Count : number, CardInfoList : LinkedList )
    {
        //先三个，再两个
        let  ThreeCard = 0;	// 前面三张的数量
        let  k = 1;
        let  UseIndex : LinkedList = new LinkedList();
        for ( let i = 1; i <= Count; i++ )
        {
            let CardLogicValue = GuanDanScenes.Instance.GetGDCardLogicValue( CardInfoList.Get(i).Card );
            if ( CardLogicValue == OutValue )
            {
                UseIndex.Push( i );
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( CardInfoList.Get(i) );
                RiverCard.SetVisible(true);
                ThreeCard += 1;
                k = k + 1;
            }
        }

        //有可能三张的不够，需要补充百搭
        if ( ThreeCard < 3 )
        {
            for ( let i = 1; i <= Count; i++ )
            {
                if ( CardInfoList.Get(i).Card == GuanDanScenes.Instance.CurSeries )
                {
                    UseIndex.Push( i );
                    let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                    if ( RiverCard == null ) continue;
                    RiverCard.SetCardInfo( CardInfoList.Get(i) );
                    RiverCard.SetVisible(true);
                    ThreeCard = ThreeCard + 1;
				    k = k + 1;
                    if (ThreeCard == 3)
                    {
                        break;
                    }
                }
            }
        }

        for ( let i = 1; i <= Count; i++ )
        {
            if ( !UseIndex.Contain( i ) )
            {
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( CardInfoList.Get(i) );
                RiverCard.SetVisible(true);
                k = k + 1;
            }
        }
    }

    //顺子排序（有百搭的话需要放到合适的位置上）
    private RiverCardShunZiSort( OutValue : number , Count : number, CardInfoList : LinkedList )
    {
        this.OutCardSort( CardInfoList , OutValue );
        let RandMatchNums = 0;
        CardInfoList.ForEach( ( item : GameCard )=>
        {
            if ( item.Card == GuanDanScenes.Instance.CurSeries )
            {
                RandMatchNums += 1;
            }
        } );

        if ( 0 == RandMatchNums )
        {
            for ( let i = 1; i <= Count; i++ )
            {
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( CardInfoList.Get(i) );
                RiverCard.SetVisible(true);
            }
            return;
        }

        let NorMalCardList = new LinkedList();  //正常牌
        let RandMatchList  = new LinkedList();  //百搭牌

        for ( let i = CardInfoList.GetCount(); i >= 1; i-- )    //从小到大的顺序
        {
            let CardInfo = CardInfoList.Get(i);
            if ( CardInfo.Card == GuanDanScenes.Instance.CurSeries )
            {
                RandMatchList.Push( CardInfo );
            }else
            {
                NorMalCardList.Push( CardInfo );
            }
        }

        NorMalCardList.Sort( ( a : GameCard , b : GameCard) =>
        {
            let av = this.GetRiverCardShunZiValue( OutValue , a.Card );
            let bv = this.GetRiverCardShunZiValue( OutValue , b.Card );
            return av < bv;
        } );

        let FinalCardList  = new LinkedList();  //最终的列表
        let MaxValue = this.GetRiverCardShunZiValue( OutValue , NorMalCardList.Get( NorMalCardList.GetCount() ).Card );

        for ( let i = 1 ; i<= NorMalCardList.GetCount(); i++ )
        {
            let CardInfo : GameCard = NorMalCardList.Get( i );
            if ( CardInfo == null ) continue;
            let CardInfoNext : GameCard = NorMalCardList.Get( i + 1 );
            if ( CardInfoNext != null )
            {
                let CardValue     = this.GetRiverCardShunZiValue( OutValue , CardInfo.Card );
                let CardValueNext = this.GetRiverCardShunZiValue( OutValue , CardInfoNext.Card );
                if ( CardValueNext == CardValue + 1 ) // 连续的
                {
                    FinalCardList.Push( CardInfo );
                }else if ( CardValueNext == CardValue + 2 )
                {
                    if ( RandMatchList.GetCount() > 0 )
                    {
                        let RMCardInfo = RandMatchList.Get(1);
                        FinalCardList.Push( CardInfo );
                        FinalCardList.Push( RMCardInfo );
                        RandMatchList.RemoveByIndex( 1 );
                    }else
                    {
                        cc.log("RiverCardShunZiSort RandMatchList Count Error!111");
                    }
                }else if ( CardValueNext == CardValue + 3 )     //中间隔两个
                {
                    if ( RandMatchList.GetCount() > 1 )
                    {
                        let RMCardInfo1 = RandMatchList.Get(1);
                        let RMCardInfo2 = RandMatchList.Get(2);
                        FinalCardList.Push( CardInfo );
                        FinalCardList.Push( RMCardInfo1 );
                        FinalCardList.Push( RMCardInfo2 );
                        RandMatchList.Clear();
                    }else
                    {
                        cc.log("RiverCardShunZiSort RandMatchList Count Error!222");
                    } 
                }
            } 
            else    //已经没有下一个了
            {
                FinalCardList.Push( CardInfo );
            }    
        }
        //如果正常牌的最大值和顺子的值一样，在最小牌后追加
        if ( NorMalCardList.GetCount() != 5 )
        {
            if ( MaxValue == OutValue )
            {
                for ( let i = 1; i <= RandMatchList.GetCount(); i++  )
                {
                    FinalCardList.Insert( 1 , RandMatchList.Get(i) );
                }
            }
            else if ( MaxValue == OutValue - 1 ) //正常牌的最大值比顺子值小1
            {
                if ( RandMatchList.GetCount() == 1 )
                {
                    FinalCardList.Push( RandMatchList.Get( 1 ) );
                }else if ( RandMatchList.GetCount() == 2 )
                {
                    FinalCardList.Insert( 1 , RandMatchList.Get(1) );
                    FinalCardList.Push( RandMatchList.Get( 2 ) );
                }
                else
                {
                    cc.log("RiverCardShunZiSort Append List Error!111");
                }
            }
            else if ( MaxValue == OutValue - 2 )
            {
                if ( RandMatchList.GetCount() == 2 )
                {
                    for ( let i = 1; i <= RandMatchList.GetCount(); i++  )
                    {
                        FinalCardList.Insert( 1 , RandMatchList.Get(i) );
                    }
                }
                else
                {
                    cc.log("RiverCardShunZiSort Append List Error!222");
                }
            }else
            {
                FinalCardList.Append( RandMatchList );
                cc.log("RiverCardShunZiSort Append List Error!333");
            }
        }

        let k = 1;
        for ( let i = FinalCardList.GetCount(); i >=1 ; i-- )
        {
            let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(k);
            if ( RiverCard == null ) continue;
            RiverCard.SetCardInfo( FinalCardList.Get(i) );
            RiverCard.SetVisible(true);
            k++;
        }
    }

    // 钢板排序
    private RiverCardGangBanSort( OutValue : number , Count : number, CardInfoList : LinkedList )
    {
        this.OutCardSort( CardInfoList , OutValue );
        let RandMatchNums = 0;
        CardInfoList.ForEach( ( item : GameCard )=>
        {
            if ( item.Card == GuanDanScenes.Instance.CurSeries )
            {
                RandMatchNums += 1;
            }
        } );

        if ( 0 == RandMatchNums )
        {
            for ( let i = 1; i <= Count; i++ )
            {
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( CardInfoList.Get(i) );
                RiverCard.SetVisible(true);
            }
            return;
        }

        let ListNoSeries = new LinkedList();
        let SeriesCards = new Array();
        for ( let i = 1; i <= CardInfoList.GetCount(); i++ )
        {
            let Card : GameCard = CardInfoList.Get(i);
            if ( Card == null ) continue;
            if ( Card.Card != GuanDanScenes.Instance.CurSeries )
            {
                ListNoSeries.Push( Card );
            }else
            {
                SeriesCards.push( Card );
            }
        }

        if ( SeriesCards.length == 1 )//只有一个百搭，找到两张牌的，后面追加一个Card即可
        {
            for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
            {
                let Nums = this.GetGangBanSameValueNums( ListNoSeries , i );
                if ( Nums == 2 ) 
                {
                    ListNoSeries.Insert( i + 2 , SeriesCards[0]);
                    break;
                }
            }

            for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
            {
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( ListNoSeries.Get(i) );
                RiverCard.SetVisible(true);
            }
        }else if ( SeriesCards.length == 2 )
        {
            let doubleIdx1 = -1;
            let doubleIdx2 = -1;
            for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
            {
              let Nums = this.GetGangBanSameValueNums( ListNoSeries , i );
              if ( 2 == Nums )
              {
                  if ( doubleIdx1 < 0 ){ doubleIdx1 = i; }
                  else if ( doubleIdx2 < 0 ){ doubleIdx2 = i; }
              }
            }
            if ( doubleIdx1 > 0 && doubleIdx2 > 0 )
            {
                ListNoSeries.Insert( doubleIdx1 + 2 ,SeriesCards[0] );
                ListNoSeries.Insert( ListNoSeries.GetCount() + 1 ,SeriesCards[1] );
                for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
                {
                    let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                    if ( RiverCard == null ) continue;
                    RiverCard.SetCardInfo( ListNoSeries.Get(i) );
                    RiverCard.SetVisible(true);
                }
            }else
            {
                for ( let i = 1; i <= Count; i++ )
                {
                    let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                    if ( RiverCard == null ) continue;
                    RiverCard.SetCardInfo( CardInfoList.Get(i) );
                    RiverCard.SetVisible(true);
                }
            }
        }
    }

    //两连对排序（百搭要放到合适的位置上）
    private RiverCardLiangLianDuiSort( OutValue : number , Count : number, CardInfoList : LinkedList )
    {
        this.OutCardSort( CardInfoList , OutValue );
        let RandMatchNums = 0;
        CardInfoList.ForEach( ( item : GameCard )=>
        {
            if ( item.Card == GuanDanScenes.Instance.CurSeries )
            {
                RandMatchNums += 1;
            }
        } );

        if ( 0 == RandMatchNums )
        {
            for ( let i = 1; i <= Count; i++ )
            {
                let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                if ( RiverCard == null ) continue;
                RiverCard.SetCardInfo( CardInfoList.Get(i) );
                RiverCard.SetVisible(true);
            }
            return;
        }

        if ( 1 == RandMatchNums )   //只有一个百搭，这种情况相对简单
        {
            let CV = 0;	// 牌值
		    let CN = 0;	// 牌数量
		    let Idx = -1; // 取到的索引
            let SeriesCard = null;
            let ListClone = new LinkedList();

            CardInfoList.ForEach( ( item : GameCard )=>
            {
                if ( item.Card != GuanDanScenes.Instance.CurSeries )
                {
                    ListClone.Push( item );
                }else
                {
                    SeriesCard = item;
                }
            } );

            for ( let i = 1; i <= ListClone.GetCount(); i++ )
            {
                let CardValue = GameDefine.GetCardValue( ListClone.Get(i ).Card );
                if ( CardValue != CV ) //找到不一样的了，因为过来的列表是排好序的，所以这么写是安全的，否则不可以
                {
                    if ( CN ==1 )
                    {
                        Idx = i;
                        break;
                    }else
                    {
                        CV = CardValue;
                        CN = 1;
                        if ( i == ListClone.GetCount() )
                        {
                            Idx == ListClone.GetCount() + 1;
                            break;
                        }
                    }
                }else
                {
                    CN = CN + 1;
                }
            }

            if ( Idx < 0 )
            {
                for ( let i = 1 ; i <= Count; i++ )
                {
                    let River = this.mRiverCardList.Get(i);
                    if ( River == null ) continue;
                    River.SetCardInfo( CardInfoList.Get(i) );
                    River.SetVisible( true );
                }
            }else
            {
                ListClone.Insert( Idx , SeriesCard );
                for ( let i = 1 ; i <= ListClone.GetCount(); i++ )
                {
                    let River = this.mRiverCardList.Get(i);
                    if ( River == null ) continue;
                    River.SetCardInfo( ListClone.Get(i) );
                    River.SetVisible( true );
                }
            }
            return;
        }

        if ( 2 == RandMatchNums )   //只有2个百搭
        {	
            let SeriesCards = new Array();
		    let ListNoSeries = new LinkedList();
		    let NoSeriesValue = 0;
            let NoSeriesNums = 0;			// 非百搭牌的种类
            CardInfoList.ForEach( ( item : GameCard )=>
            {
                if ( item.Card != GuanDanScenes.Instance.CurSeries )
                {
                    ListNoSeries.Push( item );
                    if ( item.Card != NoSeriesValue )
                    {
                        NoSeriesNums = NoSeriesNums + 1;
                        NoSeriesValue = item.Card;
                    }
                }else
                {
                    SeriesCards.push( item );
                }
            } );

            if ( 3 == NoSeriesNums )      // 差两张不一样的百搭
            {
                let singleIdx1 = -1;
                let singleIdx2 = -1;
                for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
                {
                  let Nums = this.GetLiangLianDuiSameValueNums( ListNoSeries , i );
                  if ( 1 == Nums )
                  {
                      if ( singleIdx1 < 0 ){ singleIdx1 = i; }
                      else if ( singleIdx2 < 0 ){ singleIdx2 = i; }
                  }
                }
                if ( singleIdx1 > 0 && singleIdx2 > 0 )
                {
                    ListNoSeries.Insert( singleIdx1 + 1 ,SeriesCards[0] );
                    ListNoSeries.Insert( singleIdx2 + 2 ,SeriesCards[1] );
                    for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
                    {
                        let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                        if ( RiverCard == null ) continue;
                        RiverCard.SetCardInfo( ListNoSeries.Get(i) );
                        RiverCard.SetVisible(true);
                    }
                }
            }
            else if ( 2 == NoSeriesNums )   // 差一列
            {
                let MaxValue = ListNoSeries.Get(1).Value;
                if ( MaxValue == 1 ) MaxValue =14;
                let MinValue = ListNoSeries.Get( ListNoSeries.GetCount()).Value;
                if ( MaxValue - MinValue > 1 )  //中间差了一列，必须塞到中间去
                {
                    ListNoSeries.Insert( 3 ,SeriesCards[0] );
                    ListNoSeries.Insert( 3 ,SeriesCards[1] );
                    for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
                    {
                        let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                        if ( RiverCard == null ) continue;
                        RiverCard.SetCardInfo( ListNoSeries.Get(i) );
                        RiverCard.SetVisible(true);
                    }
                }
                else                //要考虑值是多少了
                {
                    if ( MaxValue == OutValue )
                    {
                        ListNoSeries.Insert( 1 , SeriesCards[0] );
                        ListNoSeries.Insert( 1 , SeriesCards[1] );
                    }
                    for ( let i = 1; i <= ListNoSeries.GetCount(); i++ )
                    {
                        let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                        if ( RiverCard == null ) continue;
                        RiverCard.SetCardInfo( ListNoSeries.Get(i) );
                        RiverCard.SetVisible(true);
                    }
                }
            }
            else
            {
                for ( let i = 1; i <= Count; i++ )
                {
                    let RiverCard : GDCardUIPanel = this.mRiverCardList.Get(i);
                    if ( RiverCard == null ) continue;
                    RiverCard.SetCardInfo( CardInfoList.Get(i) );
                    RiverCard.SetVisible(true);
                }
            }
        }
    }

    // 出牌基本排序
    private OutCardSort( CardInfoList : LinkedList, OutValue : number )
    {
        CardInfoList.Sort( ( a : GameCard, b : GameCard ) =>
        {
            let va = a.Value;
            let vb = b.Value;
            if ( OutValue == 14 )
            {
                if ( va == 1 ) { va = 14; }
                if ( vb == 1 ) { vb = 14; }
            }
            return va > vb;
        });
    }

    private SortAllGroupCardByColor()
    {
        this.HandCardGrpList.ForEach( (item : GDHandCardGroup)=>
        {
            if ( item == null )return;
            item.SortCardByColor();
        } );
    }

    private GetRiverCardShunZiValue( OutValue : number , Card  : number ) : number
    {
        let CardValue = GameDefine.GetCardValue( Card );
        if ( CardValue == 1)
        {
            return OutValue == 14 ? 14 : 1;
        }
        
        return CardValue;
    }

    //获取钢板牌型中同牌值的牌个数是多少
    private GetGangBanSameValueNums( CardInfoList : LinkedList , Idx : number )
    {
        let cv : GameCard = CardInfoList.Get( Idx );
        if ( cv == null ) return 0;
        let ret = 0;
        CardInfoList.ForEach( (item : GameCard)=>
        {
            if (item.Value == cv.Value && item.Value != GuanDanScenes.Instance.CurSeries )
            {
                ret += 1;
            }
        } );
        return ret;
    }

    //获取两连对牌型中同牌值的牌个数是多少
    private GetLiangLianDuiSameValueNums( CardInfoList : LinkedList , Idx : number )
    {
        let cv : GameCard = CardInfoList.Get( Idx );
        if ( cv == null ) return 0;
        let ret = 0;
        CardInfoList.ForEach( (item : GameCard)=>
        {
            if (item.Value == cv.Value && item.Value != GuanDanScenes.Instance.CurSeries )
            {
                ret += 1;
            }
        } );
         return ret;
    }

    //移除一个手牌组
    public RemoveGroup( Group : GDHandCardGroup )
    {
        let Idx = this.HandCardGrpList.IndexOf( Group );
        if ( Idx < 0 ) return;
        Group.GDSeat = null;
        this.HandCardGrpList.RemoveOneByValue( Group );
    }
    
    //显示抗贡大王
    public ShowResistKingCard( Show : boolean )
    {
        this.mKingCardList.ForEach( (item : GDCardUIPanel)=>
        {
            if ( item == null ) return;
            item.SetVisible( false );
        } );

        if ( Show == false ) return;
        if ( GuanDanScenes.Instance.IsResistKingRole( this.BindRoleID ) )
        {
            let KingRoleNums = GuanDanScenes.Instance.GetResistKingRole().GetCount();
			let ShowNums = 0;
			if ( KingRoleNums == 1)     {ShowNums = 2;}
            else if (KingRoleNums == 2) {ShowNums = 1; }
            for ( let i = 1; i <= ShowNums; i++ )
            {
                if ( i <= 2 )
                {
                    let KindCard =  this.mKingCardList.Get( i );
                    if ( KindCard == null ) return;
                    KindCard.SetVisible( true );
                    let CardInfo = new GameCard( 0x42 );
                    KindCard.SetCardInfo( CardInfo );
                }
            }
        } 
    }

    //播放出牌特效
    public PlayCardKindEffect( Value : number )
    {
        let Kind = Value & 0xFF;
        let SpineName = "";
        let ProtoBuf = NetManager.GetProtobuf();
        if (Kind == ProtoBuf.TGuanDanCT.CT_SHUN_ZI)             { SpineName = "GuanDan/shuiz_wj"; }
        else if (Kind == ProtoBuf.TGuanDanCT.CT_GANG_BAN)       { SpineName = "GuanDan/gangb_wj"; }
        else if (Kind == ProtoBuf.TGuanDanCT.CT_LIANG_LIAN_DUI) { SpineName = "GuanDan/mud_wj";   } 
        else if (Kind == ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN)  { SpineName = "GuanDan/tonghs_wj";}
        else if (Kind == ProtoBuf.TGuanDanCT.CT_SI_ZHANG_BOMB)  { SpineName = "GuanDan/zhad_wj";  }   
        else if (Kind == ProtoBuf.TGuanDanCT.CT_WU_ZHANG_BOMB)  { SpineName = "GuanDan/zhad_wj";  } 
        else if (Kind == ProtoBuf.TGuanDanCT.CT_LIU_ZHANG_BOMB) { SpineName = "GuanDan/zhad_wj";  }
        else if (Kind == ProtoBuf.TGuanDanCT.CT_QI_ZHANG_BOMB)  { SpineName = "GuanDan/zhad_wj";  } 
        else if (Kind == ProtoBuf.TGuanDanCT.CT_BA_ZHANG_BOMB)  { SpineName = "GuanDan/zhad_wj";  } 
        else if (Kind == ProtoBuf.TGuanDanCT.CT_JIU_ZHANG_BOMB) { SpineName = "GuanDan/zhad_wj";  }
        else if (Kind == ProtoBuf.TGuanDanCT.CT_SHI_ZHANG_BOMB) { SpineName = "GuanDan/zhad_wj";  }
        else if (Kind == ProtoBuf.TGuanDanCT.CT_FOUR_KING)      { SpineName = "GuanDan/wangz_wj"; }
        if (SpineName.length == 0) { return 0; }

        //播放spine;
        let Obj : cc.Node = ResourcesManager.LoadSpine( GameDefine.SpinePath + SpineName , this.EffectParent , false , "play" );
    }

    //播放借风特效
    public PlayJieFengEffect()
    {
        let SpineName = "GuanDan/jiefeng";
        let Obj : cc.Node = ResourcesManager.LoadSpine( GameDefine.SpinePath + SpineName , this.EffectParent , false , "play" );
    }

    //查看其它玩家
    private OnClickOpenOther()
    {
        this.PlayButtonAudio();
        if( this.mBindRoleID == 0 ) return;
        PlayerDataModule.SetLookID( this.mBindRoleID );
        UIManager.ShowGameUI( GameDefine.GameUIConfig.UI_GAMEPLAYERINFO );
    }

    public  get GamePlayer()        : GamePlayer        { return this.mGamePlayer;      }
    public  get HandCardList()      : LinkedList        { return this.mHandCardList;    }
    public  get RiverCardList()     : LinkedList        { return this.mRiverCardList;   }
    public  get HandCardGrpList()   : LinkedList        { return this.mHandCardGrpList; }
    public  get CardLayout()        : GuanDanCardLayout { return this.mCardLayout;      }
    public  get BindRoleID()        : number            { return this.mBindRoleID;      }
    public  get GiftCardList()      : GDCardUIPanel[]   { return this.mGiftCardList;    }
    public  set CardLayout( Param : GuanDanCardLayout ) { this.mCardLayout = Param;     }
    public  set GiftCardList( Param : GDCardUIPanel[] ) { this.mGiftCardList = Param;   }
}

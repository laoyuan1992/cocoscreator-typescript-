import GameDefine from "../Module/GameDefine";
import LinkedList from "../../Common/DataStruct/LinkedList";
import GuanDanCardLayout from "./GuanDanCardLayout";
import GameCard from "../Module/GameCard";
import NetManager from "../../Common/Net/NetManager";
import PickItem from "./PickItem";
import UIMatchItemCell from "../../Match/View/UIMatchItemCell";
import Util from "../../Utility/Util";
import UIRecordSeatsBase from "./UIRecordSeatsBase";
import GDRecordCardUIPanel from "./GDRecordCardUIPanel";
import GDRecordHandCardGroup from "./GDRecordHandCardGroup";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";
import ResourcesManager from "../../Framework/ResourcesManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRecordSeatsBottom extends UIRecordSeatsBase
{

    // /初始化手牌位置到发牌点仅Bottom需要，所以说Bottom重写
    public InitHandCardPosition(Idx : number , Count : number , CardUI : GDRecordCardUIPanel )
    {
        if ( null == CardUI ) return;
        // 位置，没看明白之前求位置的意图，先任意写一个再说吧
        let x = this.HandCardParent.position.x;			// 偏移以便能居中
        let vTargetPos = new cc.Vec2( x, 450.0);
        CardUI.node.setPosition( vTargetPos );
    }

    //创建一张手牌
    public CreateHandCardInst( CardInfo : GameCard  ) : GDRecordCardUIPanel
    {
        let Path = GameDefine.PrefabPath + "GuanDanRecordHandCard";
        let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.HandCardParent );
        if( Obj == null ) return;
        let GDCard : GDRecordCardUIPanel  = Obj.getComponent( "GDRecordCardUIPanel" );
        if ( GDCard == null )return;
        GDCard.SetCardInfo( CardInfo );
        this.HandCardList.Push( GDCard );
        return GDCard;
    }

    public LayoutHandCards()
    {
        let LayoutWeight = 1130;
        let Weight = 0;
        let Height = 0;
        let Count = this.HandCardGrpList.GetCount() % 2;
        Height = GameDefine.BottomCardGap;
        if ( this.HandCardGrpList.GetCount() <= 10)
        {
            Weight = 0;
        }else
        {
             Weight = -( this.HandCardGrpList.GetCount() * this.CardLayout.CardWeight - LayoutWeight) / ( this.HandCardGrpList.GetCount() - 1 );     
        }
        
        for ( let idx = 1; idx <= this.HandCardGrpList.GetCount(); idx ++ )
        {
            let Grp : GDRecordHandCardGroup = this.HandCardGrpList.Get( idx );
            Grp.SetSortIndex( idx );
            let Idx = this.GetGrpXOffset(idx);
            for ( let j = 1 ; j <= Grp.HandCardList.GetCount(); j++ )
            {
                let GDCardUI : GDRecordCardUIPanel = Grp.HandCardList.Get( j );
                let x = Idx * ( this.CardLayout.CardWeight + Weight );
                let y = this.CardLayout.CardHeigt * 0.5 + Height * j;
                GDCardUI.SetMoveToPos( new cc.Vec2(x,y) );
            }
        }
    }

    //获取排版x偏移（偏移了几个牌的宽度）
    public GetGrpXOffset( Idx : number ) : number
    {
        let LeftOff = (this.HandCardGrpList.GetCount() - 1) * -0.5;
        let XOffset = LeftOff + (Idx - 1) * 1.0;
        return XOffset;
    }

    //设置牌排版信息
    public SetCardLayout()
    {
        if ( this.CardLayout == null )
        {
            this.CardLayout = new  GuanDanCardLayout();
        }
        this.CardLayout.XCollocateMode = GameDefine.XCollocateMode.XCenter;
        this.CardLayout.YCollocateMode = GameDefine.YCollocateMode.YBottom;
        this.CardLayout.Horizontal = true;
        this.CardLayout.CardWeight = GameDefine.BottomCardWidth;
        this.CardLayout.CardHeigt  = GameDefine.BottomCardHeight;
    }

    //刷新手牌显示状态
    public RefreshHandCardVisible( State )
    {
        this.HandCardList.ForEach( (item :GDRecordCardUIPanel ) =>
    {
       item.SetVisible(State);
    } )
    }

    //刷新手牌
    public RefreshHandCard()
    {
        if ( RecordGuanDanScenes.Instance.CurPutOutCards.GetCount() == 0 && RecordGuanDanScenes.Instance.LastPlayerPutOutCars.GetCount() == 0 )
        {
            return;
        }
        if( RecordGuanDanScenes.Instance.CurPutOutCards.GetCount() == 0 )
        {
            this.OutCardToCardRiverEffect( RecordGuanDanScenes.Instance.LastPlayerPutOutCars );
            this.RemovePlayerDataHandCards( RecordGuanDanScenes.Instance.LastPlayerPutOutCars );
        }else
        {
            this.OutCardToCardRiverEffect( RecordGuanDanScenes.Instance.LastPlayerPutOutCars );
            this.RemovePlayerDataHandCards( RecordGuanDanScenes.Instance.CurPutOutCards );
        }
        this.LayoutHandCards();
        this.SetAllHandCardsMove( 0.3 );
        RecordGuanDanScenes.Instance.SetJieFengID( 0 );
    }

    public GetRiverEndPos() : cc.Vec2
    {
        return new cc.Vec2( 1162, 376 );
    }

    public GetRiverInitPos() : cc.Vec2
    {
        return new cc.Vec2( 14, -236 );
    }

    public SelectGrpCardOnly( Idx )
    {
        if ( Idx < 1 || Idx > this.HandCardGrpList.GetCount() )
        {
            return;
        }
        this.HandCardGrpList.ForEach( (item : GDRecordHandCardGroup)=>
        {
            if ( item == null )return;
            item.SelectAll( false );
        } );
        let Grp = this.HandCardGrpList.Get(Idx);
        Grp.SelectAll( true );
    }

    public SelectCardByPromptOptiInfo( CardKindInfo : any )
    {
        this.ResetCardsSelectState();
        let ProtoBuf = NetManager.GetProtobuf();
        if ( CardKindInfo.KindType == ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN )
        {
            CardKindInfo.CardValueList.ForEach( (item ) =>
            {
                if ( item == null) return;
                this.SelectCardByValue( item );
            } );
        }else
        {   
            CardKindInfo.CardValueList.ForEach( (item ) =>
            {
                if ( item == null) return;
                this.SelectCardGrpLast( item );
            } );
        }
        
    }

    //根据牌值选中牌
    private SelectCardByValue( CV )
    {
        for ( let i = 1; i <= this.HandCardList.GetCount(); i++ )
        {
            let item : GDRecordCardUIPanel = this.HandCardList.Get(i);
            if ( item == null ) continue;
            if ( item.GetCardInfo().Card == CV && item.GetSelected() == false )
            {
                item.SetSelected( true );
                break;
            }
        }
    }

    //根据组选牌
    private SelectCardGrpLast( CV )
    {
        for ( let i = 1; i <= this.HandCardGrpList.GetCount(); i++ )
        {
            let Grp : GDRecordHandCardGroup = this.HandCardGrpList.Get(i);
            for ( let j = 1; j <= Grp.HandCardList.GetCount(); j++ )
            {
                let CardUI : GDRecordCardUIPanel = Grp.HandCardList.Get(j);
                if ( CardUI == null ) return;
                if ( CardUI.GetCardInfo().Card == CV && CardUI.GetSelected() == false )
                {
                    CardUI.SetSelected( true );
                    return;
                }
            }
        }
    }

    //重置选择状态
    private ResetCardsSelectState()
    {
        this.HandCardList.ForEach( (item : GDRecordCardUIPanel ) =>
        {
            if ( item == null ) return;
            item.SetSelected( false );
        });
    }


    //删除玩家手牌
    private RemovePlayerDataOneHandCards( GDCardInfo : GameCard )
    {
        if ( null == GDCardInfo ) return;
        let GDCardUI :GDRecordCardUIPanel = this.FindGDCardUIByIndex( GDCardInfo.Index );
        if ( null == GDCardUI )
        {
            GDCardUI = this.FindGDCardUIByCardValue( GDCardInfo.Card );
        }
        if ( null == GDCardUI ) return;
        this.GamePlayer.RemoveHandCardByValue( GDCardUI.GetCardInfo() );
        this.HandCardList.RemoveOneByValue( GDCardUI );
        GDCardUI.RemoveFromGroup( true );
    }

    // 删除玩家手牌
    public RemovePlayerDataHandCards( GDCardList : LinkedList )
    {
        if ( null == GDCardList ) return;
        GDCardList.ForEach( (GDCard : GameCard)=>
        {
            if ( GDCard == null ) return;
            let GDCardUI :GDRecordCardUIPanel = this.FindGDCardUIByIndex( GDCard.Index );
            if ( null == GDCardUI || GDCardUI.GetCardInfo().Card == GDCard.Card )
            {
                GDCardUI = this.FindGDCardUIByCardValue( GDCard.Card );
            }
            if ( null == GDCardUI ) return;
            this.GamePlayer.RemoveHandCardByValue( GDCardUI.GetCardInfo() );
            this.HandCardList.RemoveOneByValue( GDCardUI );
            GDCardUI.RemoveFromGroup( true );
        } );
    }

    //获取手牌距离拉伸的group数量
    public GetStretchGroupNums() : number
    {
        let Nums = 0;
        this.HandCardGrpList.ForEach( ( item : GDRecordHandCardGroup) =>
        {
            if ( item.Stretch ) 
            {
                Nums++;
            }
        });
        return Nums;
    }

    //播放贡牌从玩家位置飞到牌桌中间的效果
    public  ShowSendGiftCardEffect( MsgCardInfo )
    {
        let Idx = -1;
        for (let i = 0; i < this.GiftCardList.length; i++)
        {
            if( this.GiftCardList[i].GetVisible() == false )
            {
                Idx = i;
                break;
            }
        }
        if(Idx < 0) return;
        let GDHandCardUI = this.GetHandCard( MsgCardInfo );
        if( null == GDHandCardUI )
        {
            GDHandCardUI = this.FindGDCardUIByCardValue( MsgCardInfo.card );
            if( null == GDHandCardUI)
            {
                console.error("UISeatsBottom:ShowSendGiftCardEffect Get nil :" + MsgCardInfo.card);
                return;
            }
        }
        let GDCardInfo = new GameCard(MsgCardInfo.card);
        let GDGiftCardUI = this.GiftCardList[Idx];
        GDGiftCardUI.SetCardInfo(GDCardInfo);
        GDGiftCardUI.SetVisible( false );
        GDGiftCardUI.GetCardInfo().Index = MsgCardInfo.index;
        GDGiftCardUI.SetSendCardID(this.GetBindID());
        let _From = GDGiftCardUI.node.convertToWorldSpaceAR(GDGiftCardUI.node.position)
        let VFrom = this.GiftCardList[Idx].node.convertToNodeSpaceAR(_From);
        GDGiftCardUI.node.setPosition(VFrom);
        let VTo = this.GetGiftCardToPos(Idx);
        let Action = cc.moveTo(0.2 , VTo);
        GDGiftCardUI.node.stopAllActions()
        GDGiftCardUI.SetVisible(true);
        GDGiftCardUI.node.runAction(Action);
        RecordGuanDanScenes.Instance.RecordGiftCardIndex();
        GDGiftCardUI.SetGiftCardFlag(RecordGuanDanScenes.Instance.GetGiftCardIndex() , true);

        this.RemovePlayerDataOneHandCards( GDCardInfo );
        this.LayoutHandCards();
        this.SetAllHandCardsMove(0.3);
    }

    //播放贡牌从牌桌飞向玩家效果
    public ShowRecvGiftCardEffect()
    {
        let MsgCardInfo = RecordGuanDanScenes.Instance.CurGiftRoomInfo.send_card;
        if( null == MsgCardInfo ) return;
        let Idx = -1;
        for (let i = 0; i < this.GiftCardList.length; i++) {
            let GDCardUI = this.GiftCardList[i];
            if(GDCardUI.GetVisible() &&  Util.Equal64Num( GDCardUI.GetSendCardID() , RecordGuanDanScenes.Instance.CurGiftRoomInfo.scr_role_id ) && GDCardUI.GetCardInfo().Index == MsgCardInfo.index && GDCardUI.GetCardInfo().Card == MsgCardInfo.card)
            {
                Idx = i;
                break;
            }
        }
        if(Idx < 0) return;

        let CardInfo = this.GamePlayer.AddHandCard(MsgCardInfo);
        if( null == CardInfo)
        {
            console.error("UISeatsBottom:ShowRecvGiftCardEffect() AddHandCard return nil");
            return;
        }
        this.GamePlayer.RefreshHandCardIndex();
        RecordGuanDanScenes.Instance.SortCardList(this.GamePlayer.HandCardList);
        let GDHandCardUI = this.AddAndInitialCard( CardInfo );
        if( null == GDHandCardUI)
        {
            console.error("UISeatsBottom:ShowRecvGiftCardEffect() AddHandCard return nil");
            return;
        }

        this.ClearGroup();
        this.ResetHandCardGroup( this.GamePlayer.HandCardList );
        this.LayoutHandCards();
        this.HandCardList.ForEach( (item :GDRecordCardUIPanel)=>
        {
            if ( item == null ) return;
            item.SetImageDepth();
        } );

        let GiftCardUI = this.GiftCardList[Idx];
        let _From = GDHandCardUI.node.convertToWorldSpaceAR(GDHandCardUI.node.position)
        let VFrom = this.GiftCardList[Idx].node.convertToNodeSpaceAR(_From);
        GDHandCardUI.node.setPosition(VFrom);
        GiftCardUI.SetGiftCardFlag(RecordGuanDanScenes.Instance.GetGiftCardIndex() , true);
        GiftCardUI.SetVisible(false);
        GDHandCardUI.SetVisible(true);
        this.SetAllHandCardsMove(0.3);
    }

    private AddAndInitialCard( CardInfo :GameCard )
    {
        let GDHandCard = this.CreateHandCardInst( CardInfo )
        if( null == GDHandCard ) return null;
        GDHandCard.SetVisible( true );
        GDHandCard.SetCardInfo( CardInfo );
        return GDHandCard;
    }


    
}

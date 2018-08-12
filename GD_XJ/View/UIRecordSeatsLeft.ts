import UIRecordSeatsBase from "./UIRecordSeatsBase";
import GameCard from "../Module/GameCard";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";
import Util from "../../Utility/Util";
import GDRecordCardUIPanel from "./GDRecordCardUIPanel";
import GuanDanCardLayout from "./GuanDanCardLayout";
import GameDefine from "../Module/GameDefine";
import GDRecordHandCardGroup from "./GDRecordHandCardGroup";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIRecordSeatsLeft extends UIRecordSeatsBase
{
    public GetRiverEndPos() : cc.Vec2
    {
        return new cc.Vec2( 859, 130 );
    }

    public GetRiverInitPos() : cc.Vec2
    {
        return new cc.Vec2( -65, 130 );
    }

    private AddAndInitialCard( CardInfo :GameCard )
    {
        let GDHandCard = this.CreateHandCardInst( CardInfo )
        if( null == GDHandCard ) return null;
        GDHandCard.SetVisible( true );
        GDHandCard.SetCardInfo( CardInfo );
        return GDHandCard;
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
        GiftCardUI.SetVisible(false);
        GDHandCardUI.SetVisible(true);
        this.SetAllHandCardsMove(0.3);
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
        this.CardLayout.CardWeight = 12;
        this.CardLayout.CardHeigt  = 10;
    }

    //布局手牌位置并移动到目标位置;
    public LayoutHandCards()
    {
        let LayoutHeight = 250;
        let Weight = 0;
        let Height = 0;
        let Count = this.HandCardGrpList.GetCount() % 2;
        Weight = 42;
        if ( this.HandCardGrpList.GetCount() <= 12)
        {
            Height = 9;
        }else
        {
            Height = -( this.HandCardGrpList.GetCount() * this.CardLayout.CardHeigt - LayoutHeight) / ( this.HandCardGrpList.GetCount() - Count );     
        }
        
        for ( let idx = 1; idx <= this.HandCardGrpList.GetCount(); idx ++ )
        {
            let Grp : GDRecordHandCardGroup = this.HandCardGrpList.Get( idx );
            Grp.SetSortIndex( idx );
            let Idx = this.GetGrpXOffset(idx);
            for ( let j = 1 ; j <= Grp.HandCardList.GetCount(); j++ )
            {
                let GDCardUI : GDRecordCardUIPanel = Grp.HandCardList.Get( j );
                let x = this.CardLayout.CardWeight * 0.5 + Weight * j;
                let y = -Idx * ( this.CardLayout.CardHeigt + Height );
                GDCardUI.SetMoveToPos( new cc.Vec2(x,y) );
            }
        }
    }
}

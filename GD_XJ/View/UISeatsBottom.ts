import UISeatsBase from "./UISeatsBase";
import GDCardUIPanel from "./GDCardUIPanel";
import GameDefine from "../Module/GameDefine";
import GDHandCardGroup from "./GDHandCardGroup";
import LinkedList from "../../Common/DataStruct/LinkedList";
import GuanDanCardLayout from "./GuanDanCardLayout";
import GameCard from "../Module/GameCard";
import NetManager from "../../Common/Net/NetManager";
import GuanDanScenes from "../Module/GuanDanScenes";
import PickItem from "./PickItem";
import UIMatchItemCell from "../../Match/View/UIMatchItemCell";
import Util from "../../Utility/Util";
import ResourcesManager from "../../Framework/ResourcesManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISeatsBottom extends UISeatsBase
{
    @property(PickItem)
    PickItem : PickItem               = null;

    private mMakeColumnCard : LinkedList = new LinkedList();

    // /初始化手牌位置到发牌点仅Bottom需要，所以说Bottom重写
    public InitHandCardPosition(Idx : number , Count : number , CardUI : GDCardUIPanel )
    {
        if ( null == CardUI ) return;
        // 位置，没看明白之前求位置的意图，先任意写一个再说吧
        let x = this.HandCardParent.position.x;			// 偏移以便能居中
        let vTargetPos = new cc.Vec2( x, 450.0);
        CardUI.node.setPosition( vTargetPos );
    }

    public CreateHandCardInst( CardInfo : GameCard  ) : GDCardUIPanel
    {
        let Path = GameDefine.PrefabPath + "GuanDanHandCard";
        let Obj:cc.Node = ResourcesManager.LoadPrefab( Path , this.HandCardParent );
        if( Obj == null ) return;
        let GDCard : GDCardUIPanel  = Obj.getComponent( "GDCardUIPanel" );
        if ( GDCard == null )return;
        GDCard.SetCardInfo( CardInfo );
        this.HandCardList.Push( GDCard );
        this.PickItem.AddTouchCompent( Obj );
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
            let Grp : GDHandCardGroup = this.HandCardGrpList.Get( idx );
            Grp.SetSortIndex( idx );
            let Idx = this.GetGrpXOffset(idx);
            for ( let j = 1 ; j <= Grp.HandCardList.GetCount(); j++ )
            {
                let GDCardUI : GDCardUIPanel = Grp.HandCardList.Get( j );
                let x = Idx * ( this.CardLayout.CardWeight + Weight );
                let y = this.CardLayout.CardHeigt * 0.5 + Height * j;
                GDCardUI.SetMoveToPos( new cc.Vec2(x,y) );
                let stretchy = 0;
                if ( j == 1 )
                {
                    stretchy = y;
                }else
                {
                    stretchy = y + ( j -1 )*GameDefine.GDStretchDis;
                }
                GDCardUI.SetStretchToPos( new cc.Vec2( x , stretchy ) );
            }
        }
    }

    //获取排版x偏移（偏移了几个牌的宽度）
    private GetGrpXOffset( Idx : number ) : number
    {
        let LeftOff = (this.HandCardGrpList.GetCount() - 1) * -0.5;
        let XOffset = LeftOff + (Idx - 1) * 1.0;
        return XOffset;
    }

    public ClearMakeColumnCard()
    {
        this.mMakeColumnCard.Clear();
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
    public RefreshHandCardVisible( Message )
    {
        let State = Message.detail;
        this.HandCardList.ForEach( (item :GDCardUIPanel ) =>
        {
            item.SetVisible(State);
        } )
    }

    //刷新手牌
    public RefreshHandCard()
    {
        if ( GuanDanScenes.Instance.CurPutOutCards.GetCount() == 0 && GuanDanScenes.Instance.LastPlayerPutOutCars.GetCount() == 0 )
        {
            return;
        }
        if( GuanDanScenes.Instance.CurPutOutCards.GetCount() == 0 )
        {
            this.OutCardToCardRiverEffect( GuanDanScenes.Instance.LastPlayerPutOutCars );
            this.RemovePlayerDataHandCards( GuanDanScenes.Instance.LastPlayerPutOutCars );
        }else
        {
            this.OutCardToCardRiverEffect( GuanDanScenes.Instance.LastPlayerPutOutCars );
            this.RemovePlayerDataHandCards( GuanDanScenes.Instance.CurPutOutCards );
        }
        this.LayoutHandCards();
        this.SetAllHandCardsMove( 0.3 );
        this.ResetGroupStretchState();
        GuanDanScenes.Instance.SetJieFengID( 0 );
    }

    //重新整理新的接口，仅取消上一次整成一列的手牌
    public ResetAllCardLayoutEx()
    {
        if( this.mMakeColumnCard.GetCount() == 0 ) return;
        if( this.ResetSelectedCardLayout()) return;
        if( this.mMakeColumnCard.GetCount() == 1 )              //如果没有整理过，或者只整理过一列，还是走旧的逻辑，这里是可以优化的，如果为0应该不需要执行
        {
            this.ResetAllCardLayout();
            this.ClearMakeColumnCard()                          //清空掉信息
        }
        else
        {
            //先还原回去
            GuanDanScenes.Instance.SortCardList( this.GamePlayer.HandCardList );
            this.ClearGroup();
            this.ResetHandCardGroup( this.GamePlayer.HandCardList );
            //再把之前整理好的牌，除了最后一列之外，其他的都还是按原来的方式继续整理，然后删除最后一次整理信息
            this.mMakeColumnCard.ForEach( (Item:LinkedList) => {
                if(Item == this.mMakeColumnCard.Get(this.mMakeColumnCard.GetCount())) return;
                let CardInfoList = new LinkedList();
                let NewGrp = new GDHandCardGroup();
                Item.ForEach( (Item:GDCardUIPanel) => {
                    if( !Item.GetSelected() )
                    {
                        CardInfoList.Push( Item.GetCardInfo() );
                        Item.RemoveFromGroup(false);
                        NewGrp.AddCard(Item);
                    }
                } )
                let IsBoom = GuanDanScenes.Instance.IsBoomCards( CardInfoList );
                //如果是炸弹放到最左侧，否则放到最右侧
                if(IsBoom)
                {
                    this.HandCardGrpList.Insert( 1 , NewGrp );
                }
                else
                {
                    this.HandCardGrpList.Push(NewGrp);
                }
                NewGrp.GDSeat = this;
                NewGrp.MakeColmn = true;
                //新的group排序
                NewGrp.SortGetColumn();
            } );
            this.mMakeColumnCard.RemoveByIndex(this.mMakeColumnCard.GetCount());
            this.LayoutHandCards();
            this.HandCardList.ForEach( (item) => {
                item.SetImageDepth();
            } )
            this.SetAllHandCardsMove( 0.3 );
            cc.systemEvent.emit("GD_RE_HC");
            this.ResetGroupStretchState();
        }

    }

    //重新整理
    public ResetAllCardLayout()
    {
        GuanDanScenes.Instance.SortCardList(this.GamePlayer.HandCardList);
        this.ClearGroup();
        this.ResetHandCardGroup( this.GamePlayer.HandCardList );
        this.LayoutHandCards();
        this.HandCardList.ForEach( (item) => {
            item.SetImageDepth();
        } )
        this.SetAllHandCardsMove( 0.3 );
        cc.systemEvent.emit( "GD_RE_HC" );
    }

    //恢复选中的整成一列的牌
    //返回true说明整理成功 false说明未能整理到
    public ResetSelectedCardLayout()
    {
        if( 0 == this.GetSelectedMakeColumnCardNums() )
        {
            return false;
        }
        //还原成初始状态
        GuanDanScenes.Instance.SortCardList(this.GamePlayer.HandCardList);
        this.ClearGroup();
        this.ResetHandCardGroup( this.GamePlayer.HandCardList );
        //移除被全选的整理grp
        this.mMakeColumnCard.RemoveIf( (grp:LinkedList) => {
            let CardNums = grp.GetCount();
            let SelectedNums = 0;
            grp.ForEach( (item) => {
                if( item.GetSelected() )
                {
                    SelectedNums++;
                }
            } )
            return CardNums == SelectedNums;
        } );
        this.mMakeColumnCard.ForEach( (Item:LinkedList) => {
            let CardInfoList = new LinkedList();
            let NewGrp = new GDHandCardGroup();
            Item.ForEach( (Item:GDCardUIPanel) => {
                if( !Item.GetSelected() )
                {
                    CardInfoList.Push( Item.GetCardInfo() );
                    Item.RemoveFromGroup(false);
                    NewGrp.AddCard(Item);
                }
            } )
            Item.RemoveIf( (Item) => {
                return Item.GetSelected();
            } );
            let IsBoom = GuanDanScenes.Instance.IsBoomCards( CardInfoList );
            //如果是炸弹放到最左侧，否则放到最右侧
            if(IsBoom)
            {
                this.HandCardGrpList.Insert( 1 , NewGrp );
            }
            else
            {
                this.HandCardGrpList.Push(NewGrp);
            }
            NewGrp.GDSeat = this;
            NewGrp.MakeColmn = true;
            //新的group排序
            NewGrp.SortGetColumn();
        } );
        this.LayoutHandCards();
        this.HandCardList.ForEach( (item) => {
            item.SetImageDepth();
        } )
        this.SetAllHandCardsMove( 0.3 );
        cc.systemEvent.emit("GD_RE_HC");
        this.ResetGroupStretchState();

        return true;
    }

    //获取选中的整理的牌数量
    public GetSelectedMakeColumnCardNums() : number
    {
        let Nums = 0;
        this.mMakeColumnCard.ForEach(( item ) => {
            let MakeColumn : LinkedList = item
            MakeColumn.ForEach( (item : GDCardUIPanel) => {
                if( item.GetSelected() )
                {
                    Nums++;
                }
            } )
        })
        return Nums;
    }

    public GetRiverEndPos() : cc.Vec2
    {
        return new cc.Vec2( 14, -29 );
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
        this.HandCardGrpList.ForEach( (item : GDHandCardGroup)=>
        {
            if ( item == null )return;
            item.SelectAll( false );
        } );
        let Grp = this.HandCardGrpList.Get(Idx);
        Grp.SelectAll( true );
    }

    public SelectCardByGrpPromptInfo( GrpPromptInfo : any )
    {
        if ( GrpPromptInfo.length != 2 ) return;
        this.ResetCardsSelectState();
        let GrpIdx : number = GrpPromptInfo[0];
        let CardKindInfo = GrpPromptInfo[1];
        let Grp : GDHandCardGroup= this.HandCardGrpList.Get( GrpIdx );
        if ( Grp == null ) return;
        Grp.SelectLastCards( CardKindInfo.CardValueList );
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
            let item : GDCardUIPanel = this.HandCardList.Get(i);
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
            let Grp : GDHandCardGroup = this.HandCardGrpList.Get(i);
            for ( let j = 1; j <= Grp.HandCardList.GetCount(); j++ )
            {
                let CardUI : GDCardUIPanel = Grp.HandCardList.Get(j);
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
        this.HandCardList.ForEach( (item : GDCardUIPanel ) =>
        {
            if ( item == null ) return;
            item.SetSelected( false );
        });
    }

    //设置所有的Group为不拉伸
    private ResetGroupStretchState()
    {
        this.HandCardGrpList.ForEach( ( item : GDHandCardGroup )=>
        {
            if ( item == null )
            item.Stretch = false;
        } );
    }

    //删除玩家手牌
    private RemovePlayerDataOneHandCards( GDCardInfo : GameCard )
    {
        if ( null == GDCardInfo ) return;
        let GDCardUI :GDCardUIPanel = this.FindGDCardUIByIndex( GDCardInfo.Index );
        if ( null == GDCardUI )
        {
            GDCardUI = this.FindGDCardUIByCardValue( GDCardInfo.Card );
        }
        if ( null == GDCardUI ) return;
        this.RemoveFromMakeColumnCard( GDCardUI );
        this.GamePlayer.RemoveHandCardByValue( GDCardUI.GetCardInfo() );
        this.HandCardList.RemoveOneByValue( GDCardUI );
        GDCardUI.RemoveFromGroup( true );
    }

    // 删除玩家手牌
    private RemovePlayerDataHandCards( GDCardList : LinkedList )
    {
        if ( null == GDCardList ) return;
        GDCardList.ForEach( (GDCard : GameCard)=>
        {
            if ( GDCard == null ) return;
            let GDCardUI :GDCardUIPanel = this.FindGDCardUIByIndex( GDCard.Index );
            if ( null == GDCardUI || GDCardUI.GetCardInfo().Card == GDCard.Card )
            {
                GDCardUI = this.FindGDCardUIByCardValue( GDCard.Card );
            }
            if ( null == GDCardUI ) return;
            this.RemoveFromMakeColumnCard( GDCardUI );
            this.GamePlayer.RemoveHandCardByValue( GDCardUI.GetCardInfo() );
            this.HandCardList.RemoveOneByValue( GDCardUI );
            GDCardUI.RemoveFromGroup( true );
        } );
    }

    //从整成一列列表中删除某个牌
    private RemoveFromMakeColumnCard( CardUI : GDCardUIPanel )
    {
        for ( let i = 1; i <= this.mMakeColumnCard.GetCount(); i++ )
        {
            let CardList : LinkedList = this.mMakeColumnCard.Get(i);
            if ( CardList.Contain( CardUI) )
            {
                CardList.RemoveOneByValue( CardUI );
                if ( CardList.GetCount() == 0 )
                {
                    this.mMakeColumnCard.RemoveByIndex(i);
                }
                break;
            }
        }
    }

    //添加一组速成一列的列表
    private AddMakeColumnCard( CardUIList : LinkedList )
    {
        if( null == CardUIList || CardUIList.GetCount() == 0 ) return;

        //先从旧的列表中删除掉，防止重复添加
        CardUIList.ForEach( ( item ) => {
            this.RemoveFromMakeColumnCard( item );
        })
        this.mMakeColumnCard.Push( CardUIList );
    }

    //整成一列
    public ManagerCardsLayout()
    {
        let SelCardUIList = new LinkedList();
        let SelList = new LinkedList();
        this.HandCardList.ForEach( (item : GDCardUIPanel) =>{
            if( item.GetSelected() )
            {
                SelList.Push(item.GetCardInfo());
                SelCardUIList.Push(item);
            }
        })
        if( SelList.GetCount() == 0 ) return;
        this.AddMakeColumnCard(SelCardUIList);
        //判断选中的牌是否是炸弹
        let IsBoom : boolean =  GuanDanScenes.Instance.IsBoomCards( SelList );
        //如果是炸弹放到最左侧，否则放到最右侧
        let NewGrp = new GDHandCardGroup();
        if( IsBoom )
        {
            this.HandCardGrpList.Insert(1,NewGrp);
        }
        else
        {
            this.HandCardGrpList.Push(NewGrp);
        }
        NewGrp.GDSeat = this;

        //把选中的牌从旧的group上删除掉，放到新的group上
        SelList.ForEach( ( item :GameCard ) => {
            let GDHardUI = this.FindGDCardUIByIndex( item.Index );
            if( null != GDHardUI)
            {
                GDHardUI.RemoveFromGroup(false);
                NewGrp.AddCard( GDHardUI );
            }
        } )

        if(  NewGrp.HandCardList.GetCount() == 0 ) return;
        NewGrp.MakeColmn = true;
        //新的group排序
        NewGrp.SortGetColumn();
        //设置手牌的目标位置
        this.LayoutHandCards();
        //设置手牌的层级
        this.HandCardList.ForEach( (item : GDCardUIPanel) => {
            item.SetImageDepth();
        } )
        //手牌移动到位置
        this.SetAllHandCardsMove( 0.3 );
        //通知外部移动完成
        cc.systemEvent.emit( "GD_RE_HC" );
        this.ResetGroupStretchState();
    } 

    public InvertHandCardStretch()
    {
        let StretchNums = this.GetStretchGroupNums();
        if (0 == StretchNums) 
        {
            this.SetHandCardStretch(true);
        }else
        {
            this.SetHandCardStretch(false);
        }
    }

    //获取手牌距离拉伸的group数量
    public GetStretchGroupNums() : number
    {
        let Nums = 0;
        this.HandCardGrpList.ForEach( ( item : GDHandCardGroup) =>
        {
            if ( item.Stretch ) 
            {
                Nums++;
            }
        });
        return Nums;
    }

    //设置所有手牌位置拉伸
    private SetHandCardStretch( Stretch : boolean )
    {
        this.HandCardGrpList.ForEach( ( item : GDHandCardGroup) =>
        {
            if ( item == null ) return;
            item.SetStretch( Stretch , GameDefine.GDStretchTime );
        });
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
        GDGiftCardUI.SetGiftCardFlag(true);

        this.RemovePlayerDataOneHandCards( GDCardInfo );
        this.LayoutHandCards();
        this.SetAllHandCardsMove(0.3);
    }

    //播放贡牌从牌桌飞向玩家效果
    public ShowRecvGiftCardEffect()
    {
        let MsgCardInfo = GuanDanScenes.Instance.CurGiftRoomInfo.send_card;
        if( null == MsgCardInfo ) return;
        let Idx = -1;
        for (let i = 0; i < this.GiftCardList.length; i++) {
            let GDCardUI = this.GiftCardList[i];
            if(GDCardUI.GetVisible() &&  Util.Equal64Num( GDCardUI.GetSendCardID() , GuanDanScenes.Instance.CurGiftRoomInfo.scr_role_id ) && GDCardUI.GetCardInfo().Index == MsgCardInfo.index && GDCardUI.GetCardInfo().Card == MsgCardInfo.card)
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
        GuanDanScenes.Instance.SortCardList(this.GamePlayer.HandCardList);
        let GDHandCardUI = this.AddAndInitialCard( CardInfo );
        if( null == GDHandCardUI)
        {
            console.error("UISeatsBottom:ShowRecvGiftCardEffect() AddHandCard return nil");
            return;
        }

        this.ClearGroup();
        this.ResetHandCardGroup( this.GamePlayer.HandCardList );
        this.LayoutHandCards();
        this.HandCardList.ForEach( (item :GDCardUIPanel)=>
        {
            if ( item == null ) return;
            item.SetImageDepth();
        } );

        let GiftCardUI = this.GiftCardList[Idx];
        let _From = GDHandCardUI.node.convertToWorldSpaceAR(GDHandCardUI.node.position)
        let VFrom = this.GiftCardList[Idx].node.convertToNodeSpaceAR(_From);
        GDHandCardUI.node.setPosition(VFrom);
        GiftCardUI.SetGiftCardFlag(false);
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
        this.PickItem.AddItem( GDHandCard );
        return GDHandCard;
    }
}

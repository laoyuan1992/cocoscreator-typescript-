import LinkedList from "../../Common/DataStruct/LinkedList";
import GDCardUIPanel from "../View/GDCardUIPanel";
import NetManager from "../../Common/Net/NetManager";
import { GuanDanGamePromptOpti } from "./GuanDanGamePromptOpti";
import GuanDanScenes from "./GuanDanScenes";


export default class SlideSelect extends GuanDanGamePromptOpti
{
    private mRecomCardList : LinkedList = new LinkedList();

    //更新选中的牌
    public UpdateSelectCard(CardList : LinkedList)
    {
        this.LogicColumn.ClearCCList();
        this.CardValueColumn.ClearCCList();
        this.CardValueColumn_AMin.ClearCCList();
        this.CurRedSeriesCardNums = 0;
        this.mRecomCardList.Clear();

        CardList.ForEach( (item : cc.Node) => {
            let CardUI = item.getComponent(GDCardUIPanel);
            if( CardUI == null ) return;
            if( CardUI.GetSelected() )
            {
                let Card = CardUI.GetCardInfo().Card;
                this.LogicColumn.PushHandCard(Card);
                if( Card < 0x40 )
                {
                    this.CardValueColumn.PushHandCard( Card );
                    this.CardValueColumn_AMin.PushHandCard( Card );
                }
                if( Card == GuanDanScenes.Instance.CurSeries )
                {
                    this.CurRedSeriesCardNums++;
                }
            }
        } )

        this.LogicColumn.SortByValue();
        this.LogicColumn.SortAllColumn();

        this.CardValueColumn.SortByValue();
        this.CardValueColumn.SortAllColumn();
        
        this.CardValueColumn_AMin.SortByValue();
        this.CardValueColumn_AMin.SortAllColumn();
    }

    //获取应该选中的牌列表
    public GetRecomSelectCardList()
    {
        this.GetPromptList().Clear();
        if( this.GetFreeOutSelectCardList() )
        {
            return this.GetPromptList();
        }
        this.GetMinSelectCardList();
        return this.GetPromptList();
    }

    //获取自由出牌推荐列表
    private GetFreeOutSelectCardList()
    {
        if( GuanDanScenes.Instance.IsFreeOutCard() || !GuanDanScenes.Instance.SelfIsCurActionUser() )
        {
           if( this.GetSlideTSH() ) return true;
           if( this.GetSlideSZ()  ) return true;
           if( this.GetSlideGB()  ) return true;
           if( this.GetSlideLLD() ) return true;
        }
        return false;
    }

    //获取可管上的最小牌型
    private GetMinSelectCardList()
    {
        this.CurOutCardKind  = GuanDanScenes.Instance.GetLastOutCardInfo()[0];
        this.CurOutCardValue = GuanDanScenes.Instance.GetLastOutCardInfo()[1];
        this.Clear()
        this.GetSingle();
        this.GetDouble();
        this.GetThree();
        this.GetHuLu();
        this.GetGangBan();
        this.GetLiangLianDui();
        this.GetShunZi();
        this.GetFourBomb();
        this.GetFiveBomb();
        this.GetTongHuaShun();
        this.GetSixBomb();
        this.GetSevenBomb();
        this.GetEightBomb();
        this.GetNineBomb();
        this.GetTenBomb();
        this.GetFourKingBomb();

        return this.GetPromptList().GetCount() > 0;
    }

    //获取同花顺
    private GetSlideTSH()
    {
        this.Clear();

        this.GetHandCardTongHuaShun( 0 ,true );
        this.GetHandCardTongHuaShun( 0 ,false );
        this.TongHuaShunOutPromptCardEnd();

        return this.GetPromptList().GetCount() > 0;
    }

    //获取顺子
    private GetSlideSZ()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.CurOutCardKind = ProtoBuf.TGuanDanCT.CT_SHUN_ZI;
        this.CurOutCardValue = 0;
        this.GetShunZi();

        return this.GetPromptList().GetCount() > 0;
    }

    //获取钢板
    private GetSlideGB()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.CurOutCardKind = ProtoBuf.TGuanDanCT.CT_GANG_BAN;
        this.CurOutCardValue = 0;
        this.GetGangBan();

        return this.GetPromptList().GetCount() > 0;
    }

    //获取木板
    private GetSlideLLD()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.CurOutCardKind = ProtoBuf.TGuanDanCT.CT_LIANG_LIAN_DUI;
        this.CurOutCardValue = 0;
        this.GetLiangLianDui();

        return this.GetPromptList().GetCount() > 0;
    } 
    
}

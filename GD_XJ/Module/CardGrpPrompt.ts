import LinkedList from "../../Common/DataStruct/LinkedList";
import GDHandCardGroup from "../View/GDHandCardGroup";
import GDCardUIPanel from "../View/GDCardUIPanel";
import { GuanDanGamePromptOpti } from "./GuanDanGamePromptOpti";
import GuanDanScenes from "./GuanDanScenes";

export default class CardGrpPrompt extends GuanDanGamePromptOpti
{
    public AllPromptList : LinkedList = new LinkedList();

    // 提示
    // GrpList		所有的手牌列
    public PromptAll( GrpList : LinkedList )
    {
        this.AllPromptList.Clear();

        //依然压入列，判断是否有合适的牌值，这个算法会不会比较耗，有待测试
        for ( let i = GrpList.GetCount(); i >= 1 ; i-- )
        {
            let Grp : GDHandCardGroup = GrpList.Get(i);
            if ( Grp.MakeColmn ) 
            {
                this.Clear();
                this.UpdateGrpHandCard( Grp );
                this.PromptSingleGrp();
            }
            for ( let j = 1; j <= this.GetPromptList().GetCount(); j++ )
            {
                let CardGrpPromptInfo = [i , this.GetPromptList().Get(j) ];
                this.AllPromptList.Push( CardGrpPromptInfo );
            }
        }
    }

    //更新一个列的手牌提示
    private UpdateGrpHandCard( Grp : GDHandCardGroup )
    {
        this.LogicColumn.ClearCCList();
        this.CardValueColumn.ClearCCList();
        this.CardValueColumn_AMin.ClearCCList();

        this.CurRedSeriesCardNums = 0;
        Grp.HandCardList.ForEach( (item : GDCardUIPanel) =>
        {
            if ( item == null )return;
            let Card = item.GetCardInfo().Card;
            this.LogicColumn.PushHandCard( Card );
            if ( Card < 0x40 )
            {
                this.CardValueColumn.PushHandCard( Card );
                this.CardValueColumn_AMin.PushHandCard( Card );
            }
            if ( Card == GuanDanScenes.Instance.CurSeries )
            {
                this.CurRedSeriesCardNums++; 
            }
        });

        this.LogicColumn.SortByValue();
        this.LogicColumn.SortAllColumn();

        this.CardValueColumn.SortByValue();
        this.CardValueColumn.SortAllColumn();

        this.CardValueColumn_AMin.SortByValue();
        this.CardValueColumn_AMin.SortAllColumn();
    }

    //解析一列牌的提示
    private PromptSingleGrp()
    {
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
    }

    public GetSingle() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 1 )
        {
            return false;
        }
        return super.GetSingle();
    }

    public GetDouble() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 2 )
        {
            return false;
        }
        return super.GetDouble();
    }

    public GetThree() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 3 )
        {
            return false;
        }
        return super.GetThree();
    }

    public GetHuLu() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 5 )
        {
            return false;
        }
        return super.GetHuLu();
    }

    
    public GetGangBan() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 6 )
        {
            return false;
        }
        return super.GetGangBan();
    }
        
    public GetLiangLianDui() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 6 )
        {
            return false;
        }
        return super.GetLiangLianDui();
    }

    public GetShunZi() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 5 )
        {
            return false;
        }
        return super.GetShunZi();
    }

    public GetFourBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 4 )
        {
            return false;
        }
        return super.GetFourBomb();
    }

    public GetFiveBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 5 )
        {
            return false;
        }
        return super.GetFiveBomb();
    }

    public GetTongHuaShun() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 5 )
        {
            return false;
        }
        return super.GetTongHuaShun();
    }

    public GetSixBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 6 )
        {
            return false;
        }
        return super.GetSixBomb();
    }

    public GetSevenBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 7 )
        {
            return false;
        }
        return super.GetSevenBomb();
    }

    public GetEightBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 8 )
        {
            return false;
        }
        return super.GetEightBomb();
    }

    public GetNineBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 9 )
        {
            return false;
        }
        return super.GetNineBomb();
    }

    public GetTenBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 10 )
        {
            return false;
        }
        return super.GetTenBomb();
    }

    public GetFourKingBomb() : boolean
    {
        if ( this.LogicColumn.GetCardNums() != 4 )
        {
            return false;
        }
        return super.GetFourKingBomb();
    }

}

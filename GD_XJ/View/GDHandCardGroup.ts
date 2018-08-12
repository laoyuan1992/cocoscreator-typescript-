import LinkedList from "../../Common/DataStruct/LinkedList";
import GDCardUIPanel from "./GDCardUIPanel";
import GameCard from "../Module/GameCard";
import GuanDanScenes from "../Module/GuanDanScenes";
import SceneManager from "../../Scene/SceneManager";
import GameDefine from "../Module/GameDefine";
import UISeatsBase from "./UISeatsBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GDHandCardGroup 
{
    private mHandCardList : LinkedList  = new  LinkedList(); //手牌列表(在客户端中的显示效果是，索引在前的，显示层级高，也就是说索引为1的，这张牌能显示全)
    private mGDSeat       : UISeatsBase = null;              //属于哪个座位
    private mSortIndex    : number      = 0;                 //排序索引
    private mStretch      : boolean     = false;             //是否拉伸过（扩大手牌间距），默认没有
    private mMakeColmn    : boolean     = false;             //是否是手动整理成一列的，默认false，只有整成一列的置为true
    
    // 获取牌数据
    public GetCardNums() : number
    {
        return this.mHandCardList.GetCount();
    }

    //获取排序索引
    public SetSortIndex( Value )
    {
        this.mSortIndex = Value;
    }

    //清空列表
    public ClearCards()
    {
        this.mHandCardList.ForEach( ( item )=>
        {
            let HandCard : GDCardUIPanel =  item;
            if ( HandCard == null ) return;
            HandCard.SetGroup( null );
        });

        this.mHandCardList.Clear();
    }

    // 取消所有选中状态
    public CancelSelect()
    {
        this.mHandCardList.ForEach( ( GDCard  : GDCardUIPanel )=>
        {
            GDCard.SetSelected( false );
        });
    }

    // 按花色排序
    public SortCardByColor()
    {
        if ( this.mHandCardList.GetCount() <= 1 ) return;
        this.mHandCardList.Sort( (a:GDCardUIPanel ,b:GDCardUIPanel)=> 
        {
            return a.GetCardInfo().FlowerIndex > b.GetCardInfo().FlowerIndex;
        });
    }

    // 增加一个牌
    public AddCard( GDCard : GDCardUIPanel )
    {
        if ( null == GDCard )return;
        let Idx = this.mHandCardList.IndexOf( GDCard );
        if ( Idx > 0 ) return;
        this.mHandCardList.Push( GDCard );
        GDCard.SetGroup( this );
    }

    //删除一个GDCard
    public RemoveCard(GDCard : GDCardUIPanel )
    {
        if ( null == GDCard )return;
        let Idx = this.mHandCardList.IndexOf( GDCard );
        if ( Idx < 0 ) return;
        GDCard.RestGroup();
        this.HandCardList.RemoveOneByValue( GDCard );
        if ( this.HandCardList.GetCount() == 0 && null != this.GDSeat )
        {
            this.GDSeat.RemoveGroup( this);
        }
    }

    //设置所有牌的排版信息
    public SetAllHandCardsLayoutInfo( Column: number )
    {
        for ( let i = 1; i <= this.mHandCardList.GetCount(); i++ )
        {
            let GDCard :GDCardUIPanel = this.mHandCardList.Get( i );
            GDCard.SetCardLayoutInfo( i-1 , Column );
        }
    }

    //选择全部
    public SelectAll( Selected : boolean )
    {
        this.HandCardList.ForEach( (item : GDCardUIPanel )=>
        {
            item.SetSelected( Selected );
        } );
    }

    //根据牌值列表从后往前选牌（前端显示的从后往前，其实在数据层是从前往后的）
    public SelectLastCards( CardValueList : LinkedList )
    {
        CardValueList.ForEach( (item)=>
        {
            if ( item == null )return;
            this.HandCardList.ForEach( (Card : GDCardUIPanel )=>
            {
                if ( Card == null )return;
                if (!Card.GetSelected() && Card.GetCardInfo().Card == item )
                {
                    Card.SetSelected( true );
                }
            });
        } );
    }

    public OnCardClick( GDCard : GDCardUIPanel )
    {
        if ( this.mGDSeat == null ) return;
        if ( GuanDanScenes.Instance.IsSelfGiftState() )
        {
            this.mGDSeat.CancelCardSelect();
        }

        let SCW : number= GuanDanScenes.Instance.CurrSelectWay;
        if ( SCW.toString() == GameDefine.SelectCardWay.SCW_SINGLE )
        {
            GDCard.SetSelected( !GDCard.GetSelected() );//单张模式，仅反选就可以了
        }else if (  SCW.toString() == GameDefine.SelectCardWay.SCW_COLUMN ) 
        {
            if ( this.mHandCardList.GetCount() == 1 )
            {
                GDCard.SetSelected( !GDCard.GetSelected() );//只有一张牌，同样反选
                return;
            }
            let SelectNums = this.GetSelectCardNums();
            if ( 0 == SelectNums )
            {
                this.SelectAll( true );
            }else if ( this.mHandCardList.GetCount() == SelectNums ) // 如果之前全选中了，只选中当前的牌
            {
                this.SelectAll( false );
                GDCard.SetSelected( true );
            }else
            {
                GDCard.SetSelected( !GDCard.GetSelected() ); //如果该列有选中，但并没有全选中，则反选当前的牌
            }
        }
        this.SetStretch( true , GameDefine.GDStretchTime);
    }

    public SetStretch( Stretch : boolean, Time : number )
    {
        if( this.mHandCardList.GetCount() == 1 ) return;
        if( !GuanDanScenes.Instance.CanStretchCard() ) return;

        if( this.mStretch != Stretch )
        {
            this.mStretch = Stretch;
            if( Stretch )
            {
                this.mHandCardList.ForEach( (item : GDCardUIPanel) => {
                    item.ToPosition( Time , item.GetStretchToPos() );
                } )
            }
            else
            {
                this.mHandCardList.ForEach( (item : GDCardUIPanel) => {
                    item.ToPosition( Time , item.GetMoveToPos() );
                } )
            }
        }
    }

    //设置拉伸
    public InvertStretch( Time : number )
    {
        this.SetStretch( !this.mStretch , Time );
    }

    //排序
    public SortGetColumn()
    {
        // 整成一列的排序算法
        // 客户端要求：从上到下顺序为从大到小，同点数的牌从上到下按红心，方块，草花，黑桃排列
        // 服务器定义的花色是 0 方块 1 梅花 2 红桃 3 黑桃 4 王
  
        this.mHandCardList.Sort( (a : GDCardUIPanel,b) => {
            let C1 = GameDefine.GetCardColor( a.GetCardInfo().Card );
            C1 = C1 >> 4;
            let C2 = GameDefine.GetCardColor( b.GetCardInfo().Card );
            C2 = C2 >> 4;
            let V1 = GameDefine.GetCardValue( a.GetCardInfo().Card );
            let V2 = GameDefine.GetCardValue( b.GetCardInfo().Card );

            if( C1 == 4 && C2 == 4 )
            {
                return V1 < V2;
            }
            else if( C1 == 4 && C2 < 4 )
            {
                return false;
            }
            else if( C1 < 4 && C2 == 4 )
            {
                return true;
            }
            else if( C1 < 4 && C2 < 4 )
            {
                if( V1 > V2 )
                {
                    return false;
                }
                else if( V1 < V2 )
                {
                    return true;
                }
                else if( V1 = V2 )
                {
                    return this.MakeColumnCompCardColor( C1 , C2 );
                }
            }
        });
    }

    //整成一列时的花色排序
    private MakeColumnCompCardColor( Col1 , Col2 )
    {
        if( Col1 == Col2 ) return false;
        if( 3 == Col1 ) return true;
        if( 2 == Col1 ) return false;
        if( 1 == Col1)
        {
            if( 0 == Col2 ) return true;
            else if( 2 == Col2 ) return true;
            else if( 3 == Col2 ) return false;
        }
        if( 0 == Col1 )
        {

            if( 1 == Col2 ) return false;
            else if( 2 == Col2 ) return true;
            else if( 3 == Col2 ) return false;

        }
        return false;
    }

    

    //获取选中的牌数量
    private GetSelectCardNums()
    {
        let Nums = 0;
        this.mHandCardList.ForEach( (item : GDCardUIPanel) =>
        {
            if ( null == item ) return;
            if ( item.GetSelected() )
            {
                Nums++;
            }
        } );

        return Nums;
    }


    public get HandCardList()   : LinkedList { return this.mHandCardList;   }
    public get MakeColmn()      : boolean    { return this.mMakeColmn;      }
    public get SortIndex()      : number     { return this.mSortIndex;      }
    public get GDSeat()         : UISeatsBase{ return this.mGDSeat;         }
    public get Stretch()        : boolean    { return this.mStretch;        }
    public set Stretch( State : boolean )    { this.mStretch = State;       }
    public set GDSeat( Seat : UISeatsBase | null) {  this.mGDSeat = Seat;   }
    public set MakeColmn( State : boolean )    { this.mMakeColmn = State;   }
}

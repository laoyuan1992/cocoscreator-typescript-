import LinkedList from "../../Common/DataStruct/LinkedList";
import GameCard from "../Module/GameCard";
import SceneManager from "../../Scene/SceneManager";
import GameDefine from "../Module/GameDefine";
import UIRecordSeatsBase from "./UIRecordSeatsBase";
import GDRecordCardUIPanel from "./GDRecordCardUIPanel";
import RecordGuanDanScenes from "../Module/RecordGuanDanScenes";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GDRecordHandCardGroup 
{
    private mHandCardList : LinkedList  = new  LinkedList(); //手牌列表(在客户端中的显示效果是，索引在前的，显示层级高，也就是说索引为1的，这张牌能显示全)
    private mGDSeat       : UIRecordSeatsBase = null;              //属于哪个座位
    private mSortIndex    : number      = 0;                 //排序索引
    private mStretch      : boolean     = false;             //是否拉伸过（扩大手牌间距），默认没有
    private mMakeColmn    : boolean     = false;             //是否是手动整理成一列的，默认false，只有整成一列的置为true
    
    // 获取牌数据
    public GetCardNums() : number
    {
        return this.mHandCardList.GetCount();
    }

    //清空列表
    public ClearCards()
    {
        this.mHandCardList.ForEach( ( item )=>
        {
            let HandCard : GDRecordCardUIPanel =  item;
            if ( HandCard == null ) return;
            HandCard.SetGroup( null );
        });

        this.mHandCardList.Clear();
    }

    // 取消所有选中状态
    public CancelSelect()
    {
        this.mHandCardList.ForEach( ( GDCard  : GDRecordCardUIPanel )=>
        {
            GDCard.SetSelected( false );
        });
    }

    // 按花色排序
    public SortCardByColor()
    {
        if ( this.mHandCardList.GetCount() <= 1 ) return;
        this.mHandCardList.Sort( (a:GDRecordCardUIPanel ,b:GDRecordCardUIPanel)=> 
        {
            return a.GetCardInfo().FlowerIndex > b.GetCardInfo().FlowerIndex;
        });
    }

    // 增加一个牌
    public AddCard( GDCard : GDRecordCardUIPanel )
    {
        if ( null == GDCard )return;
        let Idx = this.mHandCardList.IndexOf( GDCard );
        if ( Idx > 0 ) return;
        this.mHandCardList.Push( GDCard );
        GDCard.SetGroup( this );
    }
    
    //获取排序索引
    public SetSortIndex( Value )
    {
        this.mSortIndex = Value;
    }

    //删除一个GDCard
    public RemoveCard(GDCard : GDRecordCardUIPanel )
    {
        if ( null == GDCard )return;
        let Idx = this.mHandCardList.IndexOf( GDCard );
        if ( Idx < 0 ) return;
        GDCard.RestGroup();
        this.HandCardList.RemoveOneByValue( GDCard );
        if ( this.HandCardList.GetCount() == 0 && null != this.GDSeat )
        {
            this.GDSeat.RemoveGroup( this );
        }
    }

    //设置所有牌的排版信息
    public SetAllHandCardsLayoutInfo( Column: number )
    {
        for ( let i = 1; i <= this.mHandCardList.GetCount(); i++ )
        {
            let GDCard :GDRecordCardUIPanel = this.mHandCardList.Get( i );
            GDCard.SetCardLayoutInfo( i-1 , Column );
        }
    }

    //选择全部
    public SelectAll( Selected : boolean )
    {
        this.HandCardList.ForEach( (item : GDRecordCardUIPanel )=>
        {
            item.SetSelected( Selected );
        } );
    }

    public OnCardClick( GDCard : GDRecordCardUIPanel )
    {
    }

    //排序
    public SortGetColumn()
    {
        // 整成一列的排序算法
        // 客户端要求：从上到下顺序为从大到小，同点数的牌从上到下按红心，方块，草花，黑桃排列
        // 服务器定义的花色是 0 方块 1 梅花 2 红桃 3 黑桃 4 王
  
        this.mHandCardList.Sort( (a : GDRecordCardUIPanel,b) => {
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
        return true;
    }

    

    //获取选中的牌数量
    private GetSelectCardNums()
    {
        let Nums = 0;
        this.mHandCardList.ForEach( (item : GDRecordCardUIPanel) =>
        {
            if ( null == item ) return;
            if ( item.GetSelected() )
            {
                Nums++;
            }
        } );

        return Nums;
    }


    public get HandCardList()   : LinkedList { return this.mHandCardList;           }
    public get MakeColmn()      : boolean    { return this.mMakeColmn;              }
    public get SortIndex()      : number     { return this.mSortIndex;              }
    public get GDSeat()         : UIRecordSeatsBase{ return this.mGDSeat;           }
    public get Stretch()        : boolean    { return this.mStretch;                }
    public set Stretch( State : boolean )    { this.mStretch = State;               }
    public set GDSeat( Seat : UIRecordSeatsBase | null) {  this.mGDSeat = Seat;     }
    public set MakeColmn( State : boolean )    { this.mMakeColmn = State;           }
}

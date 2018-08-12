//掼蛋牌型提示优化，这个逐步完成，
import LinkedList from "../../Common/DataStruct/LinkedList";
import GameCard from "./GameCard";
import GuanDanScenes from "./GuanDanScenes";
import GameDefine from "./GameDefine";
import NetManager from "../../Common/Net/NetManager";
import PlayerDataModule from "../../Player/Model/PlayerDataModule";


//手牌列
class CardColumn
{
    //同一牌值（逻辑值或者实际的牌值取1）的手牌列，按红心，方块，草花，黑桃顺序排列
    private CardList : LinkedList  = new LinkedList();
    //值类型（0 逻辑 1 牌值 A最大 2 牌值 A最小）	
    public ValueType : number     = 0;
    //牌值
    public CardValue : number     = -1; 

    public constructor( ValueType : number )
    {
        this.ValueType = ValueType;
    }

    //添加一个牌
    public AddCard( Card : number )
    {
        if ( this.CardList.GetCount() == 0 )// 如果之前是空的
        {
            this.CardList.Push( Card );
            this.CardValue = this.GetCardValue( Card , this.ValueType );
        }
        else
        {
            if ( this.IsCardMatch( Card) )
            {
                this.CardList.Push( Card );
            }
        }
    }

    // 求一个牌的值
    private GetCardValue( Card: number , ValueType : number ) : number
    {
        if ( ValueType == 0 )  { return GuanDanScenes.Instance.GetGDCardLogicValue(Card); }
        else if ( ValueType == 1 )
        {
            let CardValue = Card & GameDefine.MaskValue;
            if ( CardValue == 1 ) CardValue = 14;
            return CardValue;
        }
        else if ( ValueType == 2 )
        {
            return Card & GameDefine.MaskValue;
        }

        return -1;
    }

    //判断一个值是否能匹配自己
    public IsCardMatch( Card : number)
    {
        return this.GetCardValue( Card, this.ValueType ) == this.CardValue;
    }

    // 获取牌的列表
    public GetCardList(): LinkedList
    {
        return this.CardList;
    }

    //获取一个颜色对应的手牌值，找不到返回
    public GetCardByColor( Col : number ) : number
    {
        for ( let i = 1; i <= this.CardList.GetCount(); i++ )
        {
            let CardValue : number = this.CardList.Get( i );
            let CardColor : number = GameDefine.GetCardColor( CardValue );
            if ( CardColor == Col )
            {
                return CardValue
            }
        }
        return 0;
    }

   // 根据花色排序
   public SortByColor()
   {
       if ( this.CardList.GetCount() == 0 )return;
       if ( GuanDanScenes.Instance.GetGDCardLogicValue(this.CardList.Get(1)) > 15) return;
       this.CardList.Sort( (a,b)=>
       {  
           let C1 = GameDefine.GetCardColor(a);
           C1 = C1 >> 4;
           let C2 = GameDefine.GetCardColor(b);
           C2 = C2 >> 4;
           return  this.CardColorSort( C1,C2 )
       });
   }

  //整成一列时的花色排序
   private CardColorSort( Col1 : number , Col2 : number  ) : boolean
   {
        if ( Col1 == Col2 )return false;
        if ( 3 == Col1 ) return true;
        if ( 2 == Col1 ) return false;
        if ( 1 == Col1 )
        {
            if ( 0 == Col2 ) { return true; } 
            else if ( 2 == Col2 ){ return true; }
            else if ( 3 == Col2 ) { return false; } 
        }
        if ( 0 == Col1 )
        {
            if ( 0 == Col2 ) { return false; } 
            else if ( 2 == Col2 ){ return true; }
            else if ( 3 == Col2 ) { return false; } 
        }
        return false;
   }
}

// 手牌列管理
class CardColumnMgr
{
    private CCList    : LinkedList = new LinkedList()
    private ValueType : number     = 0; //-- 值类型（0 逻辑 1 牌值）	
    public constructor( ValueType : number )
    {
        this.ValueType = ValueType;
    }

    //获取一个列
    public GetCardColumn( Card : number , ValueType: number) : CardColumn
    {
        for ( let i = 1; i <= this.CCList.GetCount(); i++ )
        {
            let CardCol : CardColumn = this.CCList.Get(i);
            if ( null== CardCol ) continue;
            if ( CardCol.IsCardMatch( Card ) )
            {
                return CardCol;
            }
        } 
        return null;
    }

    //清空cclist
    public ClearCCList()
    {
        this.CCList.Clear();
    }

    //压入一个牌
    public PushHandCard( Card : number )
    {
        let CC : CardColumn = this.GetCardColumn( Card , this.ValueType );
        if ( CC != null ) CC.AddCard( Card );
        else
        {
            let CC = new CardColumn( this.ValueType );
            CC.AddCard( Card );
            this.CCList.Push( CC ); 
        }
    }

    //获取牌列表
    public GetCCList() : LinkedList
    {
        return this.CCList;
    }

    //根据索引获取一列牌
    public GetCC( Idx ) : CardColumn
    {   
        if ( Idx < 1 || Idx > this.CCList.GetCount() )
        {
            return null;
        }
        return this.CCList.Get( Idx );
    }

    // 排序所有的列
    public SortAllColumn()
    {
        this.CCList.ForEach( (item )=>
        {
            let CC : CardColumn = item;
            if ( CC == null ) return;
            CC.SortByColor();
        });
    }

    //按从大到小的顺序排列
    public SortByValue()
    {
        this.CCList.Sort( ( a : CardColumn, b : CardColumn) =>
        {
           return a.CardValue > b.CardValue;
        });
    }

    //获取手牌数量
    public GetCardNums()
    {
        let Num = 0;
        this.CCList.ForEach( ( item )=>
        {
            Num = Num + item.GetCardList().GetCount();
        });
        return Num;
    }
}

//输出提示
class OutPromptCardInfo
{
    private mCardValueList : LinkedList = new LinkedList(); // 牌值列表
    private mKindType      : number     = 0;                // 牌型
    private mUseRandMatch  : boolean    = false;            // 是否使用了百搭

    public constructor( InList : LinkedList, KindType : number ,UserRandMatch : boolean )
    {
        this.mKindType = KindType;
        this.mCardValueList .Assign( InList );
        this.mUseRandMatch = UserRandMatch;
    }
    
    public get CardValueList() : LinkedList         {   return this.mCardValueList;         }
    public get KindType() : number                  {   return this.mKindType;              }
    public get UseRandMatch() : boolean             {   return this.mUseRandMatch;          }
    public set CardValueList( CVList : LinkedList ) {   this.mCardValueList.Assign(CVList); }
    public set KindType( Type : number)             {   this.mKindType = Type;              }
    public set UseRandMatch( RandMatch : boolean)   {   this.mUseRandMatch = RandMatch;     }

}

// 输出牌大小排序
class OutPromptCardSort
{
    private mCardList       : LinkedList = new LinkedList(); // 牌值列表
    private mCardValue      : number     = 0;                // 牌型
    private mUseRandMatch   : boolean    = false;            // 是否使用了百搭

    public constructor( InList : LinkedList, CardValue : number ,UserRandMatch : boolean )
    {
        this.mCardList      = InList.Clone();
        this.mCardValue     = CardValue;
        this.mUseRandMatch  = UserRandMatch;
    }

    public Rest()
    {
        this.mCardList.Clear();
        this.mCardValue     = 0
        this.mUseRandMatch  = false;
    }

    public get CardList() : LinkedList         {   return this.mCardList;           }
    public get CardValue() : number            {   return this.mCardValue;          }
    public get UseRandMatch() : boolean        {   return this.mUseRandMatch;       }
}

//提示
export class GuanDanGamePromptOpti
{
    private mLogicColumn              : CardColumnMgr = new CardColumnMgr( 0 ); //根据逻辑值排列的表
    private mCardValueColumn          : CardColumnMgr = new CardColumnMgr( 1 ); //此列表会排除掉大小王
    private mCardValueColumn_AMin     : CardColumnMgr = new CardColumnMgr( 2 ); //A最小！
    private mCurOutCardValue          : number        = 0;                      //当前牌桌出牌的牌值
    private mCurOutCardKind           : number        = 0;                      //当前牌桌出牌的牌型
    private mPromptList               : LinkedList    = new LinkedList();       //提示的牌列表（存储牌值）
    private mCurRedSeriesCardNums     : number        = 0;                      //手里的百搭牌数量
    private mCurBombValue             : number        = 0;                      //当前炸弹牌型的牌值

    private mGuanBanPromptSort        : LinkedList    = new LinkedList();       //钢板提示排序    
    private mLiangLianDuiPromptSort   : LinkedList    = new LinkedList();       //两连对提示排序    
    private mShunZiPromptSort         : LinkedList    = new LinkedList();       //顺子提示排序   
    private mTongHuaShunPromptSort    : LinkedList    = new LinkedList();       //同花顺提示排序

    public constructor()
    {
    }

    public Clear()
    {
        this.mPromptList.Clear();
        this.mGuanBanPromptSort.Clear();
        this.mLiangLianDuiPromptSort.Clear();
        this.mShunZiPromptSort.Clear();
        this.mTongHuaShunPromptSort.Clear();
    }

    //压入一个钢板待排序牌型
    public PushGangBanOutPromptCard( InList : LinkedList , CardValue : number , UserRandMatch : boolean )
    {   
        let Opcs : OutPromptCardSort = new OutPromptCardSort( InList, CardValue , UserRandMatch );
        this.mGuanBanPromptSort.Push( Opcs );
    }

    //钢板提示牌型压入完成，排序，加入最终的提示列表中
    public GangBanOutPromptCardEnd()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.PromptOrderSort( this.mGuanBanPromptSort );
        this.mGuanBanPromptSort.ForEach( ( item )=>
        {
            let opcs :OutPromptCardSort  = item;
            if ( opcs == null ) return;
            this.PushPromptList( opcs.CardList,ProtoBuf.TGuanDanCT.CT_GANG_BAN, opcs.UseRandMatch  );
        });
    }

    //两连对排序
    public PushLiangLianDuiOutPromptCard( InList : LinkedList , CardValue : number , UserRandMatch : boolean )
    {
        let Opcs : OutPromptCardSort = new OutPromptCardSort( InList, CardValue , UserRandMatch );
        this.mLiangLianDuiPromptSort.Push( Opcs );
    }

    public LiangLianDuiOutPromptCardEnd()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.PromptOrderSort( this.mLiangLianDuiPromptSort );

        this.mLiangLianDuiPromptSort.ForEach( ( item )=>
        {
            let opcs :OutPromptCardSort  = item;
            if ( opcs == null ) return;
            this.PushPromptList( opcs.CardList,ProtoBuf.TGuanDanCT.CT_LIANG_LIAN_DUI, opcs.UseRandMatch  );
        });
    }

    //顺子排序
    public PushShunZiOutPromptCard( InList : LinkedList , CardValue : number , UserRandMatch : boolean )
    {
        let Opcs : OutPromptCardSort = new OutPromptCardSort( InList, CardValue , UserRandMatch );
        this.mShunZiPromptSort.Push( Opcs );
    }

    public ShunZiOutPromptCardEnd()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.PromptOrderSort( this.mShunZiPromptSort );

        this.mShunZiPromptSort.ForEach( ( item )=>
        {
            let opcs :OutPromptCardSort  = item;
            if ( opcs == null ) return;
            this.PushPromptList( opcs.CardList,ProtoBuf.TGuanDanCT.CT_SHUN_ZI, opcs.UseRandMatch  );
        });
    }

    //同花顺排序
    public PushTongHuaShunOutPromptCard( InList : LinkedList , CardValue : number , UserRandMatch : boolean )
    {
        let Opcs : OutPromptCardSort = new OutPromptCardSort( InList, CardValue , UserRandMatch );
        this.mTongHuaShunPromptSort.Push( Opcs );
    }

    public TongHuaShunOutPromptCardEnd()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        this.PromptOrderSort( this.mTongHuaShunPromptSort );
        this.mTongHuaShunPromptSort.ForEach( ( item )=>
        {
            let opcs :OutPromptCardSort  = item;
            if ( opcs == null ) return;
            this.PushPromptList( opcs.CardList,ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN, opcs.UseRandMatch  );
        });
    }

    //提示牌大小排序
    public PromptOrderSort( inList : LinkedList )
    {   
        if ( inList.GetCount() <= 1) return;
        inList.Sort( ( a :OutPromptCardSort , b :OutPromptCardSort ) =>
        {
            return a.CardValue < b.CardValue;
        });
    }

    //更新手牌
    public UpdateHandCard()
    {
        let Player = GuanDanScenes.Instance.GetRolePlayer( PlayerDataModule.GetPID() );
        if ( null == Player ) return;
        this.mLogicColumn.ClearCCList();
        this.mCardValueColumn.ClearCCList();
        this.mCardValueColumn_AMin.ClearCCList();
        
        this.mCurRedSeriesCardNums  = 0;

        Player.HandCardList.ForEach( ( item )=>
        {
            let Card : number = item.Card;
            this.mLogicColumn.PushHandCard( Card );
            if ( Card < 0x40 )
            {
                this.mCardValueColumn.PushHandCard( Card );
                this.mCardValueColumn_AMin.PushHandCard( Card );
            }
            if ( Card == GuanDanScenes.Instance.CurSeries )
            {
                this.mCurRedSeriesCardNums += 1;
            }
        });

        this.mLogicColumn.SortByValue();
        this.mLogicColumn.SortAllColumn();

        this.mCardValueColumn.SortByValue();
        this.mCardValueColumn.SortAllColumn();

        this.mCardValueColumn_AMin.SortByValue();
        this.mCardValueColumn_AMin.SortAllColumn();
    }

    //更新牌桌内的出牌信息
    public UpdateOutCardInfo( CurOutCardInfo : number )
    {
        this.mCurOutCardKind  = CurOutCardInfo & 0xFF;
        this.mCurOutCardValue = CurOutCardInfo >> 8;
    }

    //重置牌桌内的出牌信息
    public ResetOutCardInfo()
    {
        this.mCurOutCardKind  = 0;
        this.mCurOutCardValue = 0;
    }

    //是否可以自由出牌
    public IsFreeOutCard() : boolean
    {
        return this.mCurOutCardKind == 0;
    }

    //获取上次出牌的信息
    public GetLastOutCardInfo() 
    {
        return [ this.mCurOutCardKind, this.mCurOutCardValue ];
    }

    //自由出牌
    public GetFree() : boolean
    {
        //判断是否可以自由出牌
        if ( this.mCurOutCardKind !=  0 ) return false;

        //查找不是炸弹的最小列
        let CCList = this.mLogicColumn.GetCCList();
        for ( let i = 1 ; i <= CCList.GetCount(); i++ )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() <= 3 )
            {
                let OutList = CardList.Clone();
                this.PushPromptList( OutList , 0 , false );
                return true;
            }
        }

        //查找最小的炸弹列
        for ( let i = 1 ; i <= CCList.GetCount(); i++ )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() >= 4 )
            {
                let OutList = CardList.Clone();
                this.PushPromptList( OutList , 0 , false );
                return true;
            }
        }

        return false;
    }

    // 单张
    public GetSingle()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_SINGLE )return false;
        let CCList = this.mLogicColumn.GetCCList();
        //查找单张
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 1 && CC.CardValue > this.mCurOutCardValue )
            {
                let OutList = CardList.Clone();
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_SINGLE , false );
            }
        }

        ///查找对子拆单张
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 2 && CC.CardValue > this.mCurOutCardValue )
            {
                let OutList = new LinkedList();
                OutList.Push(CardList.Get(1));
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_SINGLE , false );
            }
        }

        // 查找三个拆单张
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
            {
                let OutList = new LinkedList();
                OutList.Push(CardList.Get(1));
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_SINGLE , false );
            }
        }

        return true;
    }

    //对子
    public GetDouble()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_DOUBLE )return false;
        let CCList = this.mLogicColumn.GetCCList();
        //查找对子
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 2 && CC.CardValue > this.mCurOutCardValue )
            {
                let OutList = CardList.Clone();
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_DOUBLE , false );
            }
        }

        //查找三张拆对子
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
            {
                let OutList = new LinkedList();
                for ( let j = 1; j <=2 ;j++ )
                {
                    OutList.Push(CardList.Get(j) );
                }
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_DOUBLE , false );
            }
        }

        let CanUseRedSeriesCardNums = this.mCurRedSeriesCardNums;
        //查找单张+百搭
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 1 
            && CC.CardValue > this.mCurOutCardValue 
            && CC.CardValue <=15 
            && ! this.IsSeriesLogicCard( CC.CardValue ) 
            && CanUseRedSeriesCardNums > 0 )
            {
                let OutList = CardList.Clone();
                OutList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_DOUBLE , true );
            }
        }
    }

    //三张
    public GetThree()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_THREE_TIAO )return false;
        let CCList = this.mLogicColumn.GetCCList();
        //查找三个
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
            {
                let OutList = CardList.Clone();
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_THREE_TIAO , false );
            }
        }

        let CanUseRedSeriesCardNums = this.mCurRedSeriesCardNums;
        //查找对子+一张百搭
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 2 
            && CC.CardValue > this.mCurOutCardValue 
            && CC.CardValue <=15 
            && ! this.IsSeriesLogicCard( CC.CardValue ) 
            && CanUseRedSeriesCardNums > 0 )
            {
                let OutList = CardList.Clone();
                OutList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_THREE_TIAO , true );
            }
        }

        //查找单张+两个百搭
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 1 
            && CC.CardValue > this.mCurOutCardValue 
            && CC.CardValue <=15 
            && ! this.IsSeriesLogicCard( CC.CardValue ) 
            && CanUseRedSeriesCardNums > 0 )
            {
                let OutList = CardList.Clone();
                OutList.Push( GuanDanScenes.Instance.CurSeries );
                OutList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_THREE_TIAO , true );
            }
        }

    }

    //三带二
    public GetHuLu()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_HU_LU )return false;
        let CCList = this.mLogicColumn.GetCCList();
        //找最小的对子
        let MinDoubleIdx = -1;
        let MinLogicValue = 10000;
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 2 && CC.CardValue < MinLogicValue )
            {
                MinLogicValue = CC.CardValue;
				MinDoubleIdx = i;
            }
        }

        //找小最的三条
        MinLogicValue = 10000;
        let MinThreeIdx = -1;
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 3 && CC.CardValue < MinLogicValue )
            {
                MinLogicValue = CC.CardValue;
				MinThreeIdx = i;
            }
        }

        //找最小的单牌
        MinLogicValue = 10000;
	    let MinSingleIdx = -1;
        for ( let i = CCList.GetCount() ; i >= 1; i-- )
        {
            let CC : CardColumn = CCList.Get(i);
            let CardList = CC.GetCardList();
            if ( CardList.GetCount() == 1 
            && CC.CardValue < MinLogicValue 
            && CC.CardValue <=15 )
            {
                MinLogicValue = CC.CardValue;
				MinSingleIdx = i;
            }
        }

        //1 查找三带最小的对子（如果有的话）333+22
        if ( MinDoubleIdx > 0 )
        {
            for ( let i = CCList.GetCount() ; i >= 1; i-- )
            {
                let CC : CardColumn = CCList.Get(i);
                let CardList = CC.GetCardList();
                if ( CardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
                {
                    let OutList = CardList.Clone();
                    let CCMinDouble = this.mLogicColumn.GetCC( MinDoubleIdx );
                    if ( CCMinDouble == null ) continue;
                    let MinDoubleCardList = CCMinDouble.GetCardList();
                    for ( let j = 1 ; j <= MinDoubleCardList.GetCount(); j++ )
                    {
                        OutList.Push( MinDoubleCardList.Get(j) );
                    }
                    this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_HU_LU , false );
                }
            }
        }

        // 2 查找三带最小的单牌+一张百搭
        if ( MinSingleIdx > 0 && this.mCurRedSeriesCardNums > 0  )
        {
            for ( let i = CCList.GetCount() ; i >= 1; i-- )
            {
                let CC : CardColumn = CCList.Get(i);
                let CardList = CC.GetCardList();
                if ( CardList.GetCount() == 3 
                && CC.CardValue > this.mCurOutCardValue
                && !this.IsSeriesLogicCard( CC.CardValue) )
                {
                    let OutList = CardList.Clone();
                    let CCMinSingle = this.mLogicColumn.GetCC( MinSingleIdx );
                    if ( CCMinSingle == null ) continue;
                    let MinSingleCardList = CCMinSingle.GetCardList();
                    let SingleCard = MinSingleCardList.Get(1);
                    if ( SingleCard != GuanDanScenes.Instance.CurSeries )
                    {
                        OutList.Push( SingleCard );
                        OutList.Push( GuanDanScenes.Instance.CurSeries );
                        this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_HU_LU , true );
                    }
                }
            }
        }

        //3 查找三带最小的三张拆对
        if ( MinThreeIdx > 0 )
        {
            for ( let i = CCList.GetCount() ; i >= 1; i-- )
            {
                let CC : CardColumn = CCList.Get(i);
                let CardList = CC.GetCardList();
                if ( CardList.GetCount() == 3 
                && CC.CardValue > this.mCurOutCardValue
                && i != MinThreeIdx )
                {
                    let OutList = CardList.Clone();
                    let CCMinThree = this.mLogicColumn.GetCC( MinThreeIdx );
                    if ( CCMinThree == null ) continue;
                    let MinThreeCardList = CCMinThree.GetCardList();
                    for ( let j = 1 ; j <= 2; j++ )
                    {
                        OutList.Push( MinThreeCardList.Get(j) );
                    }
                    this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_HU_LU , false );
                }
            }
        }

        //4.查找二张+百搭带最小的对子
        if ( this.mCurRedSeriesCardNums > 0 && MinDoubleIdx > 0 )
        {
            for ( let i = CCList.GetCount() ; i >= 1; i-- )
            {
                let CC : CardColumn = CCList.Get(i);
                let CardList = CC.GetCardList();
                if ( CardList.GetCount() == 2 
                && CC.CardValue <= 15
                && CC.CardValue > this.mCurOutCardValue
                && i != MinDoubleIdx )
                {
                    let OutList = CardList.Clone();
                    OutList.Push( GuanDanScenes.Instance.CurSeries );
                    let CCMinDouble = this.mLogicColumn.GetCC( MinThreeIdx );
                    if ( CCMinDouble == null ) continue;
                    let MinDoubleCardList = CCMinDouble.GetCardList();
                    for ( let j = 1 ; j <= MinDoubleCardList.GetCount(); j++ )
                    {
                        OutList.Push( MinDoubleCardList.Get(j) );
                    }
                    this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_HU_LU , true );
                }
            }
        }

        //5.查找一张+二百搭带最小的对子
        if ( this.mCurRedSeriesCardNums > 1 && MinDoubleIdx > 0 )
        {
            for ( let i = CCList.GetCount() ; i >= 1; i-- )
            {
                let CC : CardColumn = CCList.Get(i);
                let CardList = CC.GetCardList();
                if ( CardList.GetCount() == 1 
                && CC.CardValue <= 15
                && CC.CardValue > this.mCurOutCardValue )
                {
                    let OutList = CardList.Clone();
                    OutList.Push( GuanDanScenes.Instance.CurSeries );
                    OutList.Push( GuanDanScenes.Instance.CurSeries );
                    let CCMinDouble = this.mLogicColumn.GetCC( MinThreeIdx );
                    if ( CCMinDouble == null ) continue;
                    let MinDoubleCardList = CCMinDouble.GetCardList();
                    for ( let j = 1 ; j <= MinDoubleCardList.GetCount(); j++ )
                    {
                        OutList.Push( MinDoubleCardList.Get(j) );
                    }
                    this.PushPromptList( OutList , ProtoBuf.TGuanDanCT.CT_HU_LU , true );
                }
            }
        }

        return true;
    }

    //获取钢板（连续的三张）
    public GetGangBan()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_GANG_BAN )return false;
        //注意这里要使用CardValueColumn!
        let CCList = this.mCardValueColumn.GetCCList();
        //1 查找真正的连续三张（333 + 444）
        for ( let i = 1 ; i <= CCList.GetCount(); i++ )
        {
            let CC : CardColumn = CCList.Get(i);
            let CCCardList = CC.GetCardList();
            if ( CCCardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
            {
               for ( let j = i + 1; j <= CCList.GetCount() ; j ++ )
               {
                   let CCJ = CCList.Get(j);
                   let CCJCardList = CCJ.GetCardList();
                   if ( CCJCardList.GetCount() == 3 && CCJ.CardValue == CC.CardValue - 1 )
                   {
                       let OutList = CCCardList.Clone();
                       OutList.Append( CCJCardList );
                       this.PushGangBanOutPromptCard(OutList, CC.CardValue, false);
                   }
                   break;
               }
            }
        }

        //2 查找 333+44*
        if ( this.mCurRedSeriesCardNums == 1 )
        {
            for ( let i = 1 ; i <= CCList.GetCount(); i++ )
            {
                let CC : CardColumn = CCList.Get(i);
                let CCCardList = CC.GetCardList();
                if ( CCCardList.GetCount() == 2 && CC.CardValue > this.mCurOutCardValue )
                {
                   for ( let j = i + 1; j <= CCList.GetCount() ; j ++ )
                   {
                       let CCJ = CCList.Get(j);
                       let CCJCardList = CCJ.GetCardList();
                       if ( CCJCardList.length == 3 && CCJ.CardValue == CC.CardValue - 1 )
                       {
                           let OutList = CCCardList.Clone();
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Append( CCJCardList );
                           this.PushGangBanOutPromptCard(OutList, CC.CardValue, true);
                       }
                       break;
                    }
                }
            }
        }

        //3 查找 333+4**
        if ( this.mCurRedSeriesCardNums == 2 )
        {
            for ( let i = 1 ; i <= CCList.GetCount(); i++ )
            {
                let CC : CardColumn = CCList.Get(i);
                let CCCardList = CC.GetCardList();
                if ( CCCardList.GetCount() == 1 && CC.CardValue > this.mCurOutCardValue )
                {
                   for ( let j = i + 1; j <= CCList.GetCount() ; j ++ )
                   {
                       let CCJ = CCList.Get(j);
                       let CCJCardList = CCJ.GetCardList();
                       if ( CCJCardList.length == 3 && CCJ.CardValue == CC.CardValue- 1 )
                       {
                           let OutList = CCCardList.Clone();
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Append( CCJCardList );
                           this.PushGangBanOutPromptCard(OutList, CC.CardValue, true);
                       }
                       break;
                    }
                }
            }
        }

        // 4 查找 33* + 444
        if ( this.mCurRedSeriesCardNums == 1 )
        {
            for ( let i = 1 ; i <= CCList.GetCount(); i++ )
            {
                let CC : CardColumn = CCList.Get(i);
                let CCCardList = CC.GetCardList();
                if ( CCCardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
                {
                   for ( let j = i + 1; j <= CCList.GetCount() ; j ++ )
                   {
                       let CCJ = CCList.Get(j);
                       let CCJCardList = CCJ.GetCardList();
                       if ( CCJCardList.length == 2 && CCJ.CardValue == CC.CardValue - 1 )
                       {
                           let OutList = CCCardList.Clone();
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Append( CCJCardList );
                           this.PushGangBanOutPromptCard(OutList, CC.CardValue, true);
                       }
                       break;
                    }
                }
            }
        }
        //5 查找 3** + 444
        if ( this.mCurRedSeriesCardNums == 2 )
        {
            for ( let i = 1 ; i <= CCList.GetCount(); i++ )
            {
                let CC : CardColumn = CCList.Get(i);
                let CCCardList = CC.GetCardList();
                if ( CCCardList.GetCount() == 3 && CC.CardValue > this.mCurOutCardValue )
                {
                   for ( let j = i + 1; j <= CCList.GetCount() ; j ++ )
                   {
                       let CCJ = CCList.Get(j);
                       let CCJCardList = CCJ.GetCardList();
                       if ( CCJCardList.length == 1 && CCJ.CardValue == CC.CardValue- 1 )
                       {
                           let OutList = CCCardList.Clone();
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Append( CCJCardList );
                           this.PushGangBanOutPromptCard(OutList, CC.CardValue, true);
                       }
                       break;
                    }
                }
            }
        }

        // 6 查找 33* + 44*
        if ( this.mCurRedSeriesCardNums == 2 )
        {
            for ( let i = 1 ; i <= CCList.GetCount(); i++ )
            {
                let CC : CardColumn = CCList.Get(i);
                let CCCardList = CC.GetCardList();
                if ( CCCardList.GetCount() == 2 && CC.CardValue > this.mCurOutCardValue )
                {
                   for ( let j = i + 1; j <= CCList.GetCount() ; j ++ )
                   {
                       let CCJ = CCList.Get(j);
                       let CCJCardList = CCJ.GetCardList();
                       if ( CCJCardList.length == 2 && CCJ.CardValue == CC.CardValue - 1 )
                       {
                           let OutList = CCCardList.Clone();
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           OutList.Append( CCJCardList );
                           OutList.Push( GuanDanScenes.Instance.CurSeries );
                           this.PushGangBanOutPromptCard(OutList, CC.CardValue, true);
                       }
                       break;
                    }
                }
            }
        }
        this.GangBanOutPromptCardEnd();
	    return true;
    }

    //获取两连对
    public GetLiangLianDui()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_LIANG_LIAN_DUI )return false;
        //注意这里要使用CardValueColumn!
        let CCList = this.mCardValueColumn.GetCCList();
        // 手里的红心级牌个数
        let CurSeriesNums = this.mCurRedSeriesCardNums;
        // 牌值列表
        let outList = new LinkedList();
        // 两连对大小
        let LiangLianDuiValue = 0;
        // 是否使用了红心级牌
        let UseRandMatch = false;
        for ( let i = 1 ; i <= CCList.GetCount(); i++ )
        {
            while( true )
            {
                let CC = CCList.Get(i);
                let CCNext = CCList.Get( i + 1 ); //下一个牌
                let CCNextNext = CCList.Get( i + 2 ); //下下一个牌
                let CCCardList = CC.GetCardList();
                //1 列的值大于出牌值 2 手里的牌+红心级牌够2个或者以上
                let CanUseSeriesNums = CurSeriesNums;// 可用的红心级牌数量
                outList.Clear();
                LiangLianDuiValue = 0;			        //重置状态
                UseRandMatch = false;		           
                if ( CCCardList.GetCount() + CanUseSeriesNums >= 2 )
                {
                    if ( CC.CardValue > this.mCurOutCardValue ) 
                    {
                        if ( CCCardList.GetCount() < 2 )
                        {
                            if ( CanUseSeriesNums < 1 )
                            {
                                break; // 红心不够，下一轮循环
                            }
                            CanUseSeriesNums = CanUseSeriesNums - (2 - CCCardList.GetCount());
                        }
                        if ( CCCardList.GetCount() >= 2 )
                        {
                            outList.Push( CCCardList.Get(1) );
                            outList.Push( CCCardList.Get(2) );
                        }else if ( CCCardList.GetCount() == 1 )
                        {
                            outList.Push( CCCardList.Get(1) );
                            outList.Push( GuanDanScenes.Instance.CurSeries );
                            CanUseSeriesNums = CanUseSeriesNums - 1;
                            UseRandMatch = true;
                        }
                        LiangLianDuiValue = CC.CardValue;	// 记录下来两连对的值
                    }
                    else if ( CC.CardValue == this.mCurOutCardValue )
                    {
                        if ( CCCardList.GetCount() < 2 )
                        {
                            break;
                        }
                        if ( CanUseSeriesNums == 2 )
                        {
                            outList.Push( GuanDanScenes.Instance.CurSeries );
                            outList.Push( GuanDanScenes.Instance.CurSeries );
                            outList.Push( CCCardList.Get(1) );
                            outList.Push( CCCardList.Get(2) );
                            UseRandMatch = true;
                            LiangLianDuiValue = CC.CardValue;				// 记录下来两连对的值
                            CCNextNext = null;								    // 已经不在需要判断下下个了
                            CanUseSeriesNums = 0;
                        }else
                        {
                            break;
                        }
                    }else
                    {
                        break;
                    }
    
                    if ( CCNext != null )
                    {
                        if ( CCNext.CardValue == LiangLianDuiValue - 1 )
                        {
                            if ( CCNext.GetCardList().GetCount() >= 2 )
                            {
                                outList.Push( CCNext.GetCardList().Get(1) );
                                outList.Push( CCNext.GetCardList().Get(2) );
                            }else
                            {
                                if ( CanUseSeriesNums < 1 ) // 红心不够，开始下一轮循环
                                {
                                    break;
                                }else
                                {
                                    outList.Push( CCNext.GetCardList().Get(1) );
                                    outList.Push( GuanDanScenes.Instance.CurSeries );
                                }
                            }
                        }
                        else if ( CC.CardValue - CCNext.CardValue > 2 )
                        {
                            break; //不可能组成连对，开始下一轮
                        }else
                        {
                            //中间隔了一个，还有可以组成的
                            if ( CanUseSeriesNums < 2 )
                            {
                                break;
                            }
                            else
                            {
                                outList.Push( GuanDanScenes.Instance.CurSeries );
                                outList.Push( GuanDanScenes.Instance.CurSeries );
                                UseRandMatch = true;
                                CanUseSeriesNums = 0;
                                CCNextNext = CCNext;
                            }
                        }
    
                        if ( outList.GetCount() == 6 ) //到这里有可能已经6个了，因为可能在最开始加了两个红心级牌
                        {
                            this.PushLiangLianDuiOutPromptCard( outList, LiangLianDuiValue, UseRandMatch );
                        }
                    }
                    else
                    {
                        //已经没有下一个了
                        this.AttemptMakeLLD(outList, LiangLianDuiValue, CanUseSeriesNums);
                        break;
                    }
    
                    if ( CCNextNext != null )
                    {
                        if ( CCNextNext.CardValue == LiangLianDuiValue - 2 )
                        {
                            if ( CCNextNext.GetCardList().GetCount() >= 2 )
                            {
                                outList.Push( CCNextNext.GetCardList().Get(1) );
                                outList.Push( CCNextNext.GetCardList().Get(2) );
                            }
                            else
                            {
                                if ( CanUseSeriesNums < 1 )
                                {
                                    break; //  红心不够
                                }
                                else
                                {
                                    outList.Push( CCNextNext.GetCardList().Get(1) );
                                    outList.Push( GuanDanScenes.Instance.CurSeries );
                                    UseRandMatch = true;
                                    CanUseSeriesNums = CanUseSeriesNums - 1;
                                }
                            }
                        }
                        else if ( LiangLianDuiValue - CCNextNext.CardValue > 2) 
                        {
                            this.AttemptMakeLLD(outList, LiangLianDuiValue, CanUseSeriesNums);
                            break;
                        }
                    }else
                    {
                        this.AttemptMakeLLD(outList, LiangLianDuiValue, CanUseSeriesNums);
                        break;
                    }
    
                    // 最终的结果
                    if ( outList.GetCount() == 6 )
                    {
                        this.PushLiangLianDuiOutPromptCard(outList, LiangLianDuiValue, UseRandMatch);
                    }else
                    {
                        this.AttemptMakeLLD(outList, LiangLianDuiValue, CanUseSeriesNums);
                    }
                    break;
                }else
                {
                    break;
                }	
            }
        }

        this.LiangLianDuiOutPromptCardEnd();
	    return true;
    }

    //获取顺子
    public GetShunZi()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind != ProtoBuf.TGuanDanCT.CT_SHUN_ZI )return false;
         //注意这里要使用CardValueColumn!
         let CCList = this.mCardValueColumn.GetCCList();
         // 手里的红心级牌个数
         let CurSeriesNums = this.mCurRedSeriesCardNums;
         // 牌值列表
         let outList = new LinkedList();
         // 两连对大小
         let ShunZiValue = 0;
         // 是否使用了红心级牌
         let UseRandMatch = false;
         // 当前顺子手牌值
         let CurSZCardValue = 0;
         for ( let i = 1 ; i <= CCList.GetCount(); i++ )
         {
             while( true )
             {
                let CC = CCList.Get(i);
                ShunZiValue = 0;
                let CanUseSeriesNums = CurSeriesNums;		// 可用的红心级牌数量
			    outList.Clear();							// 清空列表
                UseRandMatch = false;						// 重置状态
                if ( this.mCurOutCardValue == 14 )
                {
                    break;
                }
                if ( CC.CardValue + CanUseSeriesNums <= this.mCurOutCardValue )
                {
                    break;
                }
                if ( CC.CardValue > this.mCurOutCardValue )
                {
                    ShunZiValue = CC.CardValue;
                    CurSZCardValue = CC.CardValue;
                    outList.Push(CC.GetCardList().Get(1));
                }else
                {
                    let AppendSeriesNums = this.mCurOutCardValue - CC.CardValue + 1;
				    ShunZiValue = this.mCurOutCardValue + 1;
				    CurSZCardValue = CC.CardValue;
				    for ( let l = 1; l <= AppendSeriesNums; l ++ )
					{
                        outList.Push(GuanDanScenes.Instance.CurSeries);
                    }   
				    outList.Push(CC.GetCardList().Get(1));
				    CanUseSeriesNums = CanUseSeriesNums - AppendSeriesNums;
				    UseRandMatch = true;
                }

                let m = i + 1;
                while( m <= CCList.GetCount() )
                {
                    if ( outList.GetCount() >= 5 )
                    {
                        break;
                    }
                    let CCJ = CCList.Get(m);
                    if ( CCJ.CardValue == CurSZCardValue -1 ) // 找到连续的;
                    {
                        outList.Push( CCJ.GetCardList().Get(1) );
                        CurSZCardValue = CurSZCardValue - 1;
                    }
                    else if ( CCJ.CardValue == CurSZCardValue - 2 )
                    {
                        if ( CanUseSeriesNums > 0 )
                        {
                            outList.Push( GuanDanScenes.Instance.CurSeries );
                            CanUseSeriesNums = CanUseSeriesNums - 1;
                            UseRandMatch = true;
                            CurSZCardValue = CurSZCardValue - 1;
                            m = m - 1;
                        }else
                        {
                            break;
                        }
                    }else if ( CCJ.CardValue == CurSZCardValue - 3 )
                    {
                        if ( CanUseSeriesNums == 2 )
                        {
                           outList.Push( GuanDanScenes.Instance.CurSeries );
                           outList.Push( GuanDanScenes.Instance.CurSeries );
                           CanUseSeriesNums = 0;
                           UseRandMatch = true;
                           CurSZCardValue = CurSZCardValue - 2;
                           m = m - 1;
                        }else
                        {
                            break;
                        }
                    }else{
                        break;
                    }
                    m = m +1;
                }

                if ( outList.GetCount() == 5 )
                {
                    this.PushShunZiOutPromptCard(outList, ShunZiValue, UseRandMatch);
                }else
                {
                    this.AttemptMakeSZ(outList, ShunZiValue, CanUseSeriesNums);
                }
                break;
             }
         }
         this.ShunZiOutPromptCardEnd();
         return true;
    }

    //获取同花顺整理手牌时使用
    public GetTSHSimple()
    {   
        this.Clear();
        this.UpdateHandCard();
        this.GetHandCardTongHuaShun( 0 , true  );
        this.GetHandCardTongHuaShun( 0 , false );
        this.TongHuaShunOutPromptCardEnd();
    }

    //获取手牌里的所有同花顺
    //Amax标识A是当作最大的用，还是当用最小的用
    public GetHandCardTongHuaShun( BombValue, Amax )
    {
        //注意这里要使用CardValueColumn!
        let CCList = null;
        Amax ? CCList = this.mCardValueColumn.GetCCList() : CCList = this.mCardValueColumn_AMin.GetCCList();

        // 手里的红心级牌个数
	    let CurSeriesNums = this.mCurRedSeriesCardNums;
	    // 牌值列表
	    let outList =  new LinkedList();
	    // 同花顺大小
	    let ShunZiValue = 0;
	    // 是否使用了红心级牌
	    let UseRandMatch = false;
	    // 当前花色
	    let CurColor = -1;	
	    // 当前同花顺手牌值
	    let CurTSHCardValue = 0;
	    // 在开头追加了几个百搭
        let AppendSeriesNums = 0;
        for ( let i = 1 ; i <= CCList.GetCount(); i++ )
        {
            while ( true )
            {
                let CC = CCList.Get(i);
                ShunZiValue = 0;
                CurSeriesNums = this.mCurRedSeriesCardNums;
                let CanUseSeriesNums = CurSeriesNums;		// 可用的红心级牌数量
                outList.Clear();							// 清空列表
                UseRandMatch = false;						// 重置状态
                AppendSeriesNums = 0;						// 重置
                CurColor = -1;
                let CurBombValue = CC.CardValue + CurSeriesNums;
                CurBombValue > 14 ? CurBombValue = 14 : null;
                if ( CurBombValue <= BombValue ) // 判断是否可以管上
                {
                    break;  //继续下一次循环
                }
                if ( CC.CardValue > BombValue )
                {
                    ShunZiValue = CC.CardValue
                    CurTSHCardValue = CC.CardValue; //当前列的牌值
                }else
                {
                    AppendSeriesNums = BombValue - CC.CardValue + 1;
                    ShunZiValue = BombValue + 1;
                    CurTSHCardValue = CC.CardValue;			 // 当前列的牌值
                    CurSeriesNums = CurSeriesNums - AppendSeriesNums;
                }
    
                let CardList = CC.GetCardList();    // 手牌列表
                for ( let cli = 1 ; cli <= CardList.GetCount(); cli++ )
                {
                    outList.Clear();
                    UseRandMatch = false;
                    if ( AppendSeriesNums > 0 )
                    {
                        UseRandMatch = true;
                    }
                    CurColor = -1;
                    CanUseSeriesNums = CurSeriesNums;
                    let CardValue = CardList.Get( cli );
                    CurColor = GameDefine.GetCardColor(CardValue);	// 颜色
                    for ( let l = 1; l <= AppendSeriesNums; l++ )
                    {
                        outList.Push( GuanDanScenes.Instance.CurSeries );
                    }
                    outList.Push( CardValue );

                    let CurTSHCardValue = CC.CardValue;
                    let m = i + 1;	
                    while( m <= CCList.GetCount() )
                    {
                        if ( outList.GetCount() >= 5 )
                        {
                            break;
                        }
                        if ( outList.GetCount() == 3 || outList.GetCount() == 4 )
                        {
                            this.AttemptMakeTTS( outList.Clone() , ShunZiValue , CanUseSeriesNums );
                        }
                        let CCJ = CCList.Get(m);
                        if ( CCJ.CardValue == CurTSHCardValue - 1 ) //找到连续的
                        {
                            let SameColorCard = CCJ.GetCardByColor( CurColor );
                            if ( SameColorCard != 0 )
                            {
                                outList.Push( SameColorCard );
                                CurTSHCardValue = CurTSHCardValue - 1;
                            }else
                            {
                                if ( CanUseSeriesNums > 0 )
                                {
                                    outList.Push(GuanDanScenes.Instance.CurSeries);
                                    CanUseSeriesNums -= 1;
                                    CurTSHCardValue -= 1; 
                                    //UseRandMatch = true; 
                                }else
                                {
                                    break;
                                }
                            }
                        }else if ( CCJ.CardValue == CurTSHCardValue - 2 )
                        {
                            if ( CanUseSeriesNums > 0 )
                            {
                                outList.Push( GuanDanScenes.Instance.CurSeries );
                                CanUseSeriesNums -= 1;
                                CurTSHCardValue -= 1;
                                UseRandMatch = true; 
                                m = m -1;
                            }else
                            {
                                break;
                            }
                        }else if (  CCJ.CardValue == CurTSHCardValue - 3 )
                        {
                            if ( CanUseSeriesNums == 2 )
                            {
                                outList.Push(GuanDanScenes.Instance.CurSeries);
                                outList.Push(GuanDanScenes.Instance.CurSeries);
                                CanUseSeriesNums = 0;
                                UseRandMatch = true; 
                                CurTSHCardValue -= 2;
                                m = m - 1; 
                            }
                            else
                            {
                                break;
                            }
                        }else
                        {
                            break;
                        }
                        m = m + 1;
                    }

                    if(outList.GetCount() == 4 ||outList.GetCount() ==3 )
                    {
                        console.log("====")
                    }
                    if ( outList.GetCount() == 5 )
                    {
                        this.PushTongHuaShunOutPromptCard(outList, ShunZiValue, UseRandMatch);
                    }
                    else
                    {
                        this.AttemptMakeTTS(outList, ShunZiValue, CanUseSeriesNums);
                    }
                }
                break;
            }
        }
    }

    //获取同花顺
    public GetTongHuaShun()
    {
        //如果当前的牌型大过同花顺了，不需要处理
        let ProtoBuf = NetManager.GetProtobuf();
        if ( this.mCurOutCardKind > ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN )return false;
        //计算当前的炸弹值
        if ( this.mCurOutCardKind < ProtoBuf.TGuanDanCT.CT_TONG_HUA_SHUN )
        {
            this.mCurBombValue = 0;
        }else
        {
            this.mCurBombValue = this.mCurOutCardValue;
        }
        this.GetHandCardTongHuaShun( this.mCurBombValue , true );
        this.GetHandCardTongHuaShun( this.mCurBombValue , false );
        this.TongHuaShunOutPromptCardEnd();

        return true;
    }

    //获取炸弹牌型的牌数量
    public GetBombCardNums( BombType )
    {
        let ProtoBuf = NetManager.GetProtobuf();
        if (BombType == ProtoBuf.TGuanDanCT.CT_SI_ZHANG_BOMB)
		    return 4;
	    else if (BombType == ProtoBuf.TGuanDanCT.CT_WU_ZHANG_BOMB) 
	    	return 5;
	    else if (BombType == ProtoBuf.TGuanDanCT.CT_LIU_ZHANG_BOMB) 
		    return 6;
	    else if (BombType == ProtoBuf.TGuanDanCT.CT_QI_ZHANG_BOMB) 
		    return 7;
	    else if (BombType == ProtoBuf.TGuanDanCT.CT_BA_ZHANG_BOMB) 
		    return 8;
	    else if (BombType == ProtoBuf.TGuanDanCT.CT_JIU_ZHANG_BOMB) 
		    return 9;
	    else if (BombType == ProtoBuf.TGuanDanCT.CT_SHI_ZHANG_BOMB) 
            return 10;
            
	    return 0;
    }

    //根据类型获取炸弹
    public GetBomb(BombType)
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let CardNums = this.GetBombCardNums( BombType );
        if ( CardNums <= 0 )return false;
        if ( this.mCurOutCardKind > BombType ) return false;
        BombType > this.mCurOutCardKind ? this.mCurBombValue = 0 : this.mCurBombValue = this.mCurOutCardValue;

        let CCList =this.mLogicColumn.GetCCList();
        let CanUseRedSeriesCardNums = this.mCurRedSeriesCardNums;
        for ( let i = 1; i <= CCList.GetCount() ;i ++ )
        {
            let CC = CCList.Get(i);
            let CardList = CC.GetCardList();
            if (CC.CardValue > this.mCurBombValue && CC.CardValue < 16 )
            {
                if ( CardList.GetCount() == CardNums )
                {
                    let OutList = CardList.Clone();
                    this.PushPromptList( OutList, ProtoBuf.TGuanDanCT.CT_SI_ZHANG_BOMB, false );
                }else if ( CardList.GetCount() == CardNums - 1 )
                {
                    if ( CanUseRedSeriesCardNums > 0 )
                    {
                        let OutList = CardList.Clone();
                        OutList.Push(GuanDanScenes.Instance.CurSeries);
                        this.PushPromptList( OutList, ProtoBuf.TGuanDanCT.CT_SI_ZHANG_BOMB, true );
                    }
                }
                else if ( CardList.GetCount() == CardNums - 2)
                {
                    if ( CanUseRedSeriesCardNums == 2 )
                    {
                        let OutList = CardList.Clone();
                        OutList.Push(GuanDanScenes.Instance.CurSeries);
                        OutList.Push(GuanDanScenes.Instance.CurSeries);
                        this.PushPromptList( OutList, ProtoBuf.TGuanDanCT.CT_SI_ZHANG_BOMB, true );
                    }
                }
            }
        }
         
        return true;
    }

    //获取四张炸弹
    public GetFourBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_SI_ZHANG_BOMB);
    }
    //获取五张炸弹
    public GetFiveBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_WU_ZHANG_BOMB);
    }
    //获取六张炸弹
    public GetSixBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_LIU_ZHANG_BOMB);
    }
    //获取七张炸弹 
    public GetSevenBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_QI_ZHANG_BOMB);
    }

    //获取八张炸弹 
    public GetEightBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_BA_ZHANG_BOMB);
    }

   //获取九张炸弹 
    public GetNineBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_JIU_ZHANG_BOMB);
    }

    //获取十张炸弹 
    public GetTenBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        return this.GetBomb( ProtoBuf.TGuanDanCT.CT_SHI_ZHANG_BOMB);
    }

    //获取四王炸 
    public GetFourKingBomb()
    {
        let ProtoBuf = NetManager.GetProtobuf();
        let CCList = this.mLogicColumn.GetCCList();
        let OutList = new LinkedList();
        for ( let i = 1 ; i <= CCList.GetCount(); i++ )
        {
            let CC = CCList.Get(i);
            if( CC != null && ( CC.CardValue == 16 || CC.CardValue == 17 ) )
            {
                CC.GetCardList().ForEach( ( item ) =>
                {
                    OutList.Push(item);
                });
            }
        }

        if ( OutList.GetCount() == 4 )
        {
            this.PushPromptList(OutList, ProtoBuf.TGuanDanCT.CT_FOUR_KING, false);
            return true;
        }
        return false;
    }

    //-- 尝试去组成一个完整的两连对
    // outList				已经组合好的牌
    // lldValue				当前两连对的值
    // canUseSeriesNums		还可以用的红心级牌数量
    public AttemptMakeLLD( outList, lldValue, canUseSeriesNums )
    {
        if ( outList.GetCount() != 4 ) return;
        if ( canUseSeriesNums != 2 ) return;
        //加在最高上
        if ( lldValue <=12 )
        {
            outList.Push(GuanDanScenes.Instance.CurSeries);
            outList.Push(GuanDanScenes.Instance.CurSeries);
            this.PushLiangLianDuiOutPromptCard(outList, lldValue + 1, true);
        }
        // 加在最低上
        if ( outList.GetCount() == 6 ) return;
        if ( lldValue > this.mCurOutCardValue + 1 )
        {
            outList.Push(GuanDanScenes.Instance.CurSeries);
            outList.Push(GuanDanScenes.Instance.CurSeries);
            this.PushLiangLianDuiOutPromptCard(outList, lldValue + 1, true);
        }
    }

    //尝试组成一个顺子
    public AttemptMakeSZ( outList, szValue, CanUseSeriesNums )
    {
        if ( outList.GetCount() == 3 )
        {
            if ( CanUseSeriesNums != 2)return;
            //高位加
            if (szValue < 13)
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushShunZiOutPromptCard(outList, szValue + 2, true);
                return;
            }
            //低位加
            if ( szValue >= 5 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushShunZiOutPromptCard(outList, szValue, true);
			    return;
            }
        }else if ( outList.GetCount() == 4 )
        {
            if ( CanUseSeriesNums < 1 ) return;
            //尝试高位+百搭
            if ( szValue < 14 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushShunZiOutPromptCard(outList, szValue, true);
                return;
            }
            //低位加百搭
            if ( szValue >= 5 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushShunZiOutPromptCard(outList, szValue, true);
                return;
            }
        }
    }

    //尝试组成同花顺
    public AttemptMakeTTS(outList, thsValue, CanUseSeriesNums)
    {
        if ( outList.GetCount() == 3)
        {   
            if (CanUseSeriesNums != 2)return;
             //高位加
            if ( thsValue < 13 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushTongHuaShunOutPromptCard( outList , thsValue + 2 , true );
                return;
            }

            //低位加
            if ( thsValue >= 5 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushTongHuaShunOutPromptCard( outList , thsValue , true );
                return;
            }
        }else if ( outList.GetCount() == 4 )
        {
            if ( CanUseSeriesNums < 1 ) return;
            // 高位+百搭
            if ( thsValue < 14 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushTongHuaShunOutPromptCard( outList , thsValue  +1, true );
                return;
            }
            //低位+百搭
            if ( thsValue >= 4 )
            {
                outList.Push( GuanDanScenes.Instance.CurSeries );
                this.PushTongHuaShunOutPromptCard( outList , thsValue, true );
                return;
            }
        }
    }

    //解析
    public Prompt()
    {
        this.Clear();
        this.UpdateHandCard();
        if ( this.GetFree() )
        {
            return;
        }
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

    //获取结果 
    public GetPromptList()
    {
        return this.mPromptList;
    }

    // 判断一个提示牌是否合法
    // 有时候计算错误了，可能会生成一些不全法的提示牌，需要判断下，最常见的就是红心级牌多次被使用
    public IsPromptListValid( PromptList : LinkedList )
    {
        if ( PromptList.GetCount() <= 0 ) return false;
        let Player = GuanDanScenes.Instance.GetRolePlayer( PlayerDataModule.GetPID() ); 
        if ( Player == null ) return false;
        let HandCardList = Player.HandCardList;
        if ( HandCardList.GetCount() <= 0 ) return false;
        for ( let i = 1; i <= PromptList.GetCount(); i++ )
        {
            let Card = PromptList.Get(i);
            let HandNums = this.GetHandCardNums( HandCardList , Card );
            let PromptNums = PromptList.NumsOf( Card );
            if ( PromptNums > HandNums )
            {
                return false;
            }
        }

        return true;
    }

    //获取玩家手里有多少张一样的牌
    public GetHandCardNums(HandCardList, CardValue)
    {
        let Nums = 0;
        HandCardList.ForEach( ( item ) =>
        {
            let HandCard = item;
            if ( CardValue == HandCard.Card ) Nums++;
        });

        return Nums;
    }

    //查找输出列表中是否已经有一样的了
    public IsRepeat(inList)
    {
        for ( let i = 1 ; i <= this.mPromptList.GetCount(); i++ )
        {
            let PromptInfo = this.mPromptList.Get(i);
            if ( this.IsListEqual( inList , PromptInfo.CardValueList ))
            {
                return true;
            }
        }
        return false;
    }

    //判断两个list是否相等（元素个数一样，其中元素的数量也一样）
    public IsListEqual(List1, List2)
    {
        if ( List1.GetCount() != List2.GetCount() ) return false;
        for ( let i = 1; i <= List1.GetCount(); i++ )
        {
            let L1Element = List1.Get(i);
            if ( List1.NumsOf( L1Element ) != List2.NumsOf( L1Element ) )
            {
                return false;
            }
        }
        return true;
    }

    //压入一个提示牌列表
    public PushPromptList(PromptList, KindType, UseRandMatch)
    {
        if ( this.IsRepeat(PromptList ) ) return;
        if ( this.IsPromptListValid( PromptList ))
        {
            let PromptInfo = new OutPromptCardInfo( PromptList, KindType , UseRandMatch );
            this.mPromptList.Push( PromptInfo );
        }
    }

    //判断一张牌是不是级牌
    public IsSeriesCard(Card)
    {
        let Value = GameDefine.GetCardValue( Card );
        let CurSeriesValue = GameDefine.GetCardValue( GuanDanScenes.Instance.CurSeries );
        return Value == CurSeriesValue;
    }

    //通过logicvalue判断是不是级牌
    public IsSeriesLogicCard(LogicValue)
    {
        return LogicValue == GuanDanScenes.Instance.GetGDCardLogicValue( GuanDanScenes.Instance.CurSeries );
    }

    //移除按列提示可能出现的重复
    public RemoveGrpPromptRepeat(GrpPromptList)
    {
        for ( let i = 1; i <= GrpPromptList.GetCount() ; i++ )
        {
            let GrpPrompt = GrpPromptList.Get(i);
            let GrpPromptInfo = GrpPrompt[2];
            if ( GrpPromptInfo != null )
            {
                 this.mPromptList.RemoveIf(( item )=>
                {
                    return this.IsListEqual( GrpPromptInfo.CardValueList , item.CardValueList );
                });
            }
        }
    }

    
    public get LogicColumn()                : CardColumnMgr   { return this.mLogicColumn;             }
    public get CardValueColumn()            : CardColumnMgr   { return this.mCardValueColumn;         }
    public get CardValueColumn_AMin()       : CardColumnMgr   { return this.mCardValueColumn_AMin;     }
    public get GuanBanPromptSort()          : LinkedList      { return this.mGuanBanPromptSort;       }
    public get LiangLianDuiPromptSort()     : LinkedList      { return this.mLiangLianDuiPromptSort;  }
    public get ShunZiPromptSort()           : LinkedList      { return this.mShunZiPromptSort;        }
    public get TongHuaShunPromptSort()      : LinkedList      { return this.mTongHuaShunPromptSort;   }
    public get CurRedSeriesCardNums()       : number          { return this.mCurRedSeriesCardNums;    }

    public set CurRedSeriesCardNums( Value : number )         {  this.mCurRedSeriesCardNums= Value;    }
    public set CurOutCardKind      ( Value : number )         {  this.mCurOutCardKind= Value;          }
    public set CurOutCardValue     ( Value : number )         {  this.mCurOutCardValue= Value;         }
}


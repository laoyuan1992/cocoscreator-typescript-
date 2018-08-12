import GameDefine from "./GameDefine";

//  0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,	    //方块 A - K
//	0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,	    //梅花 A - K
//	0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,	    //红桃 A - K
//	0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D,	    //黑桃 A - K
//	0x41,0x42,                                                              //小王，大王
export default class GameCard
{
    private mColor          : number = 0;
    private mValue          : number = 0;
    private mCard           : number = 0;
    private mRow            : number = 0;
    private mColumn         : number = 0;
    private mFlowerIndex    : number = 0;
    private mIndex          : number = 0;

    public constructor( Card : number )
    {
        this.mCard  = Card;
        this.mColor = Card & GameDefine.MaskColor;
        this.mValue = Card & GameDefine.MaskValue;
        this.SetFlowerIndex();
        this.mIndex = 999;
    }

    //设置FlowerIndex
    public SetFlowerIndex()
    {
        if ( this.mColor == 0 ){   this.mFlowerIndex = 2; }
        else if ( this.mColor == 16 ){this.mFlowerIndex = 3; }
        else if ( this.mColor == 32 ){this.mFlowerIndex = 1; }
        else if ( this.mColor == 48 ){this.mFlowerIndex = 4; }
    }

    //获取牌值描述
    public GetCardDesc()
    {
        let Col = "";
        if ( this.mFlowerIndex == 1 ){ Col = "红桃"; }
        else if ( this.mFlowerIndex == 2 ){ Col = "方块"; }
        else if ( this.mFlowerIndex == 3 ){ Col = "梅花"; }
        else if ( this.mFlowerIndex == 4 ){ Col = "黑桃"; }
        else
        {
            if ( this.mValue == 1 )
            {
                return "小王" + this.mIndex;
            }else if ( this.mValue == 2 ) 
            {
                return "大王" + this.mIndex;
            }
        }

        let Val = "";
        if ( this.mValue == 1 ){ Val = "A"; }
        else if ( this.mValue >= 2 && this.mValue <= 10 ){ Val = this.mValue.toString(); }
        else if ( this.mValue == 11 ){ Val = "J"; }
        else if ( this.mValue == 12 ){ Val = "Q"; }
        else if ( this.mValue == 13 ){ Val = "K"; }

        return Col + Val + "_" + this.mIndex;
    }

    //Copy
    public Copy( CardInfo : any )
    {
        if ( null == CardInfo )
        {
            return;
        }

        this.mColor			= CardInfo._Color;
	    this.mValue			= CardInfo._Value;
	    this.mCard   		= CardInfo._Card;
	    this.mRow			= CardInfo._Row;
	    this.mColumn		= CardInfo._Column;
	    this.mFlowerIndex 	= CardInfo._FlowerIndex;
	    this.mIndex			= CardInfo._Index;
    }

    //  是否有效
    public IsValid()
    {
        return 0 != this.mValue;
    }

    //判断是否相等
    public CardEqual( card : number )
    {
        return card == this.mCard;
    }



    public get Color()         : number     {  return this.mColor;          } 
    public get Value()         : number     {  return this.mValue;          } 
    public get Card()          : number     {  return this.mCard;           } 
    public get Row()           : number     {  return this.mRow;            } 
    public get Column()        : number     {  return this.mColumn;         } 
    public get FlowerIndex()   : number     {  return this.mFlowerIndex;    } 
    public get Index()         : number     {  return this.mIndex;          } 

    public set Color( Value    : number)      {  this.mColor = Value;       } 
    public set Value( Value    : number)      {  this.mValue = Value;       } 
    public set Card( Value     : number)      {  this.mCard = Value;        } 
    public set Row( Value      : number)      {  this.mRow = Value;         } 
    public set Column( Value   : number)      {  this.mColumn = Value;      } 
    public set FlowerIndex( Value  : number)  {  this.mFlowerIndex = Value; } 
    public set Index( Value  : number)        {  this.mIndex = Value;       } 
}

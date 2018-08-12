import GameCard from "../Module/GameCard";
import GameDefine from "../Module/GameDefine";
import GuanDanScenes from "../Module/GuanDanScenes";
import GDHandCardGroup from "./GDHandCardGroup";
import ResourcesManager from "../../Framework/ResourcesManager";
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GDCardUIPanel extends UIBase 
{
    @property(cc.Sprite)
    HandZMImage: cc.Sprite      = null;  //右上角花色图

    @property(cc.Sprite)
    CenterImage: cc.Sprite      = null;  //中心花色图

    @property(cc.Sprite)
    NumImage: cc.Sprite         = null;   //牌值图

    @property(cc.Sprite)
    NumKingImage: cc.Sprite     = null;  //王牌牌值图

    @property(cc.Sprite)
    BgImage: cc.Sprite          = null;  //牌背景图

    @property(cc.Sprite)
    JinGongImage: cc.Sprite     = null;  //进贡标志

    @property(cc.Sprite)
    HuanGongImage: cc.Sprite    = null;  //还贡标志

    @property(cc.Sprite)
    CrownRImage: cc.Sprite      = null;  //级牌显示红

    @property(cc.Sprite)
    CrownYImage: cc.Sprite      = null;  //级牌显示黄

    private mCount       : number           = 0;
    private mSendCardID  : number           = 0;
    private mGroup       : GDHandCardGroup  = null;
    private mCardInfo    : GameCard         = null;
    private mMoveToPos   : cc.Vec2          = new cc.Vec2();
    private mStretchToPos: cc.Vec2          = new cc.Vec2();
    private mIsSelected  : boolean          = false;
    private mVisibleRect : cc.Rect          = new cc.Rect();
    private mRunAction   : cc.Action        = null;

    onLoad ()
    {

    }

    start () 
    {
    }

    onDestroy()
    {
        this.node.stopAllActions();
    }

    //获取移动位置
    public GetMoveToPos() : cc.Vec2
    {
        return this.mMoveToPos;
    }

    //设置位置
    public SetMoveToPos( Pos : cc.Vec2 )
    {
        this.mMoveToPos = Pos;
    }

    //获取组
    public GetGroup()
    {
        return this.mGroup;
    }

    public RestGroup()
    {
        this.mGroup = null;
    }

    //重置组
    public SetGroup( Value )
    {
        this.mGroup = Value;
    }

    // 获取选中
    public GetSelected() :boolean
    {
        return this.mIsSelected;
    }

    public SetStretchToPos( Pos : cc.Vec2 )
    {
        this.mStretchToPos = Pos;
    }

    public GetStretchToPos()
    {
        return this.mStretchToPos;
    }

    // 设置选中
    public SetSelected( Selected : boolean )
    {
        if ( this.mIsSelected == Selected )
        {
            return;
        }
        this.mIsSelected = Selected;
        this.SetImageColor();
        this.RefreshSelectedList();
    }

    //设置颜色
    public SetImageColor()
    {
        let col : cc.Color = this.mIsSelected ? cc.color(170,238,179,255) : cc.color(255,255,255,255);
        this.HandZMImage.node.color = col;
        this.CenterImage.node.color = col;
        this.NumImage.node.color    = col;
        this.BgImage.node.color     = col;
    }

    //判断是否是当前级牌
    public IsCurSeries()
    {
        if ( null == this.mCardInfo )
        {
            return false;
        }
        if ( this.mCardInfo.Color ==0x40 )
        {
            return false;
        }
        if ( this.mCardInfo.Value == ( GameDefine.MaskValue & GuanDanScenes.Instance.CurSeries ) )
        {
            return true;
        }
        return false;
    }

    //刷新_GameModule的选中列表
    public RefreshSelectedList()
    {
        this.mIsSelected ? GuanDanScenes.Instance.AddSelectedCard( this ) : GuanDanScenes.Instance.RemoveSelectedCard( this );
    }

    //获取_CardInfo
    public GetCardInfo() : GameCard
    {
        return this.mCardInfo;
    }

    //设置排版信息
    public SetCardLayoutInfo( Row : number, Column : number )
    {
        if ( this.mCardInfo )
        {
            return false;
        }
        this.mCardInfo.Row    = Row;
        this.mCardInfo.Column = Column;
    }

    //设置位置
    public AddTPosition( time : number , delay : number )
    {
        if ( null == this.mGroup ) return;
        let Idx = this.mGroup.HandCardList.IndexOf( this );
        if ( Idx < 0 ) return; 
        if ( 0 == time )
        {
            this.node.setPosition( this.mMoveToPos );
        }else
        {
            if( this.mRunAction != null)
            {
                this.node.stopAction( this.mRunAction );
            }
            let de = cc.delayTime( delay );
            let moveto = cc.moveTo( time, this.mMoveToPos );
            let seq = cc.sequence( de, moveto );
            this.mRunAction =  this.node.runAction( seq );
        }
    }

    //设置位置
    public ToPosition( time : number , Pos : cc.Vec2 )
    {
        if ( 0 == time )
        {
            this.node.setPosition( Pos );
        }
        else
        {
            if( this.mRunAction != null)
            {
                this.node.stopAction( this.mRunAction );
            }
            let moveto = cc.moveTo( time, Pos );
            let delay  = cc.delayTime(0.05);
            let seq    = cc.sequence( moveto,delay );
            this.mRunAction = this.node.runAction( seq );
        }
    }

    // 设置深度
    public SetImageDepth()
    {
        if ( null == this.mGroup )
        {
            return;
        }

        let Idx = this.mGroup.HandCardList.IndexOf( this );
        if ( Idx < 0 ) return;
        let SiblingIndex = this.GetDepth();
        this.node.setLocalZOrder( SiblingIndex );
    }

    public GetDepth() : number
    {
        if ( null == this.mGroup || null == this.mGroup.GDSeat )
        {
            return 0;
        }
        //查找自己所在的_Group之前有几个card了
        let Idx = this.mGroup.HandCardList.IndexOf( this );
        if ( Idx < 0 )
        return 0;
        Idx = this.mGroup.HandCardList.GetCount() - Idx;
        let Nums = this.mGroup.GDSeat.GetBeforeGroupCarsNums( this.mGroup );
        return Nums + Idx ;
    }

    //设置牌信息
    public SetCardInfo( CardInfo : GameCard )
    {
        this.mCardInfo = CardInfo;
        this.SetCardImage();
        this.SetImageColor();
    }

    //设置牌的Image
    private SetCardImage()
    {
        let SmallImage = "";
        let BigImage   = "";
        if ( this.mCardInfo.Card == GuanDanScenes.Instance.CurSeries )
        {
            SmallImage = "icon_table_star";
            BigImage   = GameDefine.GetBigCardImage( this.mCardInfo.Color , this.mCardInfo.Value );
        }else
        {
            SmallImage = GameDefine.GetSmallCardImage( this.mCardInfo.Color , this.mCardInfo.Value);
            BigImage   = GameDefine.GetBigCardImage( this.mCardInfo.Color , this.mCardInfo.Value );
        }
        this.HandZMImage.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , SmallImage );
        this.CenterImage.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , BigImage );

        let NumImage = GameDefine.GetCardNumImage( this.mCardInfo.Color, this.mCardInfo.Value );
        if ( this.mCardInfo.Card > 0X40 )
        {
            this.NumKingImage.node.active = true;
            this.NumImage.node.active = false;
            this.NumKingImage.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , NumImage );
        }else
        {
            this.NumKingImage.node.active = false;
            this.NumImage.node.active = true;
            this.NumImage.spriteFrame = ResourcesManager.LoadSprite( GameDefine.AtlasPath + "GuanDan" , NumImage );
        }
        this.CrownRImage.node.active = false;
        this.CrownYImage.node.active = false;
        if ( this.mCardInfo.Card ==  GuanDanScenes.Instance.CurSeries ) //  百搭
        {
            this.CrownRImage.node.active = true;
        }else if ( this.mCardInfo.Card == ( GuanDanScenes.Instance.CurSeries & GameDefine.MaskValue) && this.mCardInfo.Card < 0X40 ) //  级牌
        {
            this.CrownYImage.node.active = true;
        }
    }

    // 位置归0
    public ResetPosition()
    {
        this.node.setPosition( cc.Vec2.ZERO );
    }

    // 从_Group中移除
    // Destroy 	是否销毁
    public RemoveFromGroup( Destroy : boolean)
    {
        if ( null == this.mGroup ) return;
        this.mGroup.RemoveCard( this );
        this.mGroup = null;
        if ( Destroy )
        {
            this.node.destroy();
        }
    }

    //设置进贡还贡标志
    public SetGiftCardFlag( State : boolean )
    {
        if ( GuanDanScenes.Instance.IsSendGiftState() )
        {
            this.JinGongImage.node.active = State;
        }
        else
        {
            this.HuanGongImage.node.active = State;
        }
    }

    //  设置显示
    public SetVisible( State : boolean )
    {
        this.node.active = State;
    }

    //  获得显示
    public GetVisible() : boolean
    {
        return this.node.active;
    }

    public MouseEnter()
    {
        if ( this.mGroup == null ) return;
        this.mGroup.OnCardClick( this );
    }

    public InvertSelect()
    {
        this.SetSelected( !this.GetSelected() );
    }

    public SetSendCardID( id : number )
    {
        this.mSendCardID = id;
    }
    public GetSendCardID() : number
    {
        return this.mSendCardID;
    }

   

}

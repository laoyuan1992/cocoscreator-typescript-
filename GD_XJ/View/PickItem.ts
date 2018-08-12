import GDCardUIPanel from "./GDCardUIPanel";
import GuanDanModule from "../Module/GuanDanModule";
import GuanDanScenes from "../Module/GuanDanScenes";
import LinkedList from "../../Common/DataStruct/LinkedList";
import SlideSelect from "../Module/SlideSelect";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PickItem extends cc.Component 
{
    private PushTouchedCard : LinkedList  = new LinkedList();
    private mSlideSelect    : SlideSelect = new SlideSelect();
    onLoad () 
    {
        cc.systemEvent.on("GD_CLEARCARDSELECT"    ,  this.ClearTouchedCards  , this);//用户活动状态
        this.node.on(cc.Node.EventType.TOUCH_START,  this.OnTouchBegin       , this );
        this.node.on(cc.Node.EventType.TOUCH_MOVE,   this.OnTouchMove        , this );
        this.node.on(cc.Node.EventType.TOUCH_END,    this.OnTouchEnd         , this );
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchCancel      , this );   
    }

    onDestroy()
    {
        this.node.off(cc.Node.EventType.TOUCH_START,  this.OnTouchBegin , this );
        this.node.off(cc.Node.EventType.TOUCH_MOVE,   this.OnTouchMove ,  this );
        this.node.off(cc.Node.EventType.TOUCH_END,    this.OnTouchEnd ,   this );
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.OnTouchCancel ,this );   
    }

    private OnTouchBegin( Event )
    {
        //清理选择的牌;
        let Card = Event.target;
        let HandCards = this.node.children;
        if ( HandCards.indexOf( Card ) == -1 )
        {
            this.ClearTouchedCards();
            return;
        } 

        this.PushTouchCard( Card );
    }

    private OnTouchMove( Event )
    {
        let HandCards = this.node.children;
        if ( HandCards.length <= 0 ) return;
        let CurTouchCard = [];
        for ( let i = 0; i < HandCards.length; i++ )
        {
            if (cc.rectContainsPoint( HandCards[i].getBoundingBoxToWorld(),  Event.getLocation()) ) 
            {  
                CurTouchCard.push( HandCards[i] );
            }           
        }
        if(CurTouchCard.length == 0) return;
        let HitCard = this.GetHitItem(CurTouchCard)
        if( HitCard == null ) return;
        this.MoveTouchCard( HitCard ); 

    //     if ( CurTouchCard.length <= 0 ) return;
    //     CurTouchCard.sort( ( a : GDCardUIPanel , b : GDCardUIPanel )=>
    //     {
    //         let ADepth = a.GetDepth();
    //         let BDepth = b.GetDepth();
    //         if ( ADepth > BDepth ) return 1;
    //         else if ( ADepth == BDepth )return 0;
    //         else return -1;
    //     } );

    //    this.MoveTouchCard( CurTouchCard );
    }

    private OnTouchEnd( Event )
    {
        this.SlideSelectRecommend()
        this.PushTouchedCard.Clear();
    }

    private OnTouchCancel( Event )
    {
        this.SlideSelectRecommend();
        this.PushTouchedCard.Clear();
    }

    private ClearTouchedCards()
    {
        for ( let i = 0; i < this.node.children.length; i++ )
        {
            let UICard : GDCardUIPanel = this.node.children[i].getComponent('GDCardUIPanel');
            if ( UICard == null ) return;
            UICard.SetSelected( false );
        }
        this.PushTouchedCard.Clear();
    }

    //获取点击到的牌
    private GetHitItem( CurTouchCard : cc.Node[] )
    {
        if(CurTouchCard.length == 0) return;
        let MaxDepth = -1000;
        let RetGDCard = null;
        CurTouchCard.forEach( (item) => {
            let Depth =  this.GetHitObjDeep(item);
            if( Depth >= 0 && Depth > MaxDepth )
            {
                MaxDepth = Depth;
                RetGDCard = item;
            }
        } )
        return RetGDCard;
    }

    //获取牌的深度
    private GetHitObjDeep( Card : cc.Node )
    {
        let GDCardUI : GDCardUIPanel = Card.getComponent("GDCardUIPanel");
        if( GDCardUI == null ) return;
        return GDCardUI.GetDepth();
    }

    //move选
    private MoveTouchCard( Card : any )
    {
        if ( this.PushTouchedCard.IndexOf( Card ) == -1 )
        {
            this.PushTouchedCard.Push( Card );
            let UICard : GDCardUIPanel = Card.getComponent('GDCardUIPanel');
            if ( UICard == null ) return;
            UICard.InvertSelect();
            return;
        }
    }

    // 点选
    private PushTouchCard( Card : cc.Node )
    {
        if ( this.PushTouchedCard.IndexOf( Card ) == -1 )
        {
            this.PushTouchedCard.Push( Card );
            let UICard : GDCardUIPanel = Card.getComponent('GDCardUIPanel');
            if ( UICard == null ) return;
            UICard.MouseEnter();
        }
    }

    public AddTouchCompent( Card : cc.Node )
    {
        Card.on(cc.Node.EventType.TOUCH_START,  ()=>{} , this  );
        Card.on(cc.Node.EventType.TOUCH_MOVE,   ()=>{} , this  );
        Card.on(cc.Node.EventType.TOUCH_END,    ()=>{} , this  );
        Card.on(cc.Node.EventType.TOUCH_CANCEL, ()=>{} , this  );   
    }

    public AddItem( Item )
    {
        this.PushTouchedCard.Push( Item )
    }

    //划动选牌提示
    private SlideSelectRecommend()
    {
        this.mSlideSelect.UpdateSelectCard( this.PushTouchedCard );
        let PromptList = this.mSlideSelect.GetRecomSelectCardList();
        if( PromptList.GetCount() == 0  ) return;

        //取消之前选中的，选中推荐的牌型
        this.PushTouchedCard.ForEach( (Card) => {
            let UICard : GDCardUIPanel = Card.getComponent('GDCardUIPanel');
            if( this.IsCardRecommend( UICard , PromptList ) )
            {
                UICard.SetSelected( true );
            }
            else
            {
                UICard.SetSelected( false );
            }
        } )
    }

    //查找一个牌是否在推荐牌型之列
    //首先必须是选中的，第二，能从推荐列表中找到这个牌值
    private IsCardRecommend(CardUI : GDCardUIPanel , RecommendList : LinkedList )
    {
        if( ! CardUI.GetSelected()) return false;

        // 只取第一个（最小的）
        let FirstPrompt  = RecommendList.Get(1);

        for( let i = 1 ; i <= FirstPrompt.CardValueList.GetCount() ; i++  )
        {
            let CV = FirstPrompt.CardValueList.Get(i);
            if( CV == CardUI.GetCardInfo().Card )
            {
                FirstPrompt.CardValueList.RemoveByIndex(i);
                return true;
            }
        } 
        
        return false;
    }
}

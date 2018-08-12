import EventName from "../../Common/Event/EventName";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
//-------------------------------------------------------------------------------------------------
// 转菊花界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class UIChrysanthemum extends cc.Component {

    @property(cc.Label)
    TextTips: cc.Label = null;

    private TimeID : number = null;

    onLoad () {
        cc.systemEvent.on( EventName.EVENT_UI_SHOW_CHRYSANTHEMUM_BY_STR  , this.ShowChrysanthemum  , this );
        cc.systemEvent.on( EventName.EVENT_UI_CLOSE_CHRYSANTHEMUM_BY_STR , this.CloseChrysanthemum , this );
    }

    //显示菊花
    private ShowChrysanthemum( Message )
    {
        this.TextTips.string = Message.detail;
        this.DelayedDestroy( 13 );
    }

    //关闭菊花
    private CloseChrysanthemum( Message )
    {
        this.DelayedDestroy( Message.detail );
    }

    //创建计时器
    private CreateTimer( time )
    {
        this.RemoveTimer();
        if( this.TimeID == null )
        {
            this.TimeID = setTimeout( () => {
                UIManager.DestroyUI( UIType.UI_CHRYSANTHEMUM );
            } , time *1000 )
        }
    }

    //删除计时器
    private RemoveTimer()
    {
        if( this.TimeID != null )
        {
            clearTimeout( this.TimeID );
            this.TimeID = null;
        }
    }

    //延迟销毁菊花
    private DelayedDestroy( time )
    {
        this.CreateTimer( time );
    }

    //销毁
    onDestroy()
    {
        cc.systemEvent.off( EventName.EVENT_UI_SHOW_CHRYSANTHEMUM_BY_STR  , this.ShowChrysanthemum  , this );
        cc.systemEvent.off( EventName.EVENT_UI_CLOSE_CHRYSANTHEMUM_BY_STR , this.CloseChrysanthemum , this );
        this.RemoveTimer();
    }
}

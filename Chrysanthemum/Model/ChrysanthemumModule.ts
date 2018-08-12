import Singleton from "../../Common/Function/Singleton";
import UIManager from "../../Common/UI/UIManager";
import * as UIDefine from "../../Common/UI/UIDefine"
import MessageConfig from "../../Config/MessageConfig";
import EventName from "../../Common/Event/EventName";

//-------------------------------------------------------------------------------------------------
// 菊花模块
//-------------------------------------------------------------------------------------------------

class ChrysanthemumModule extends Singleton  
{
    //显示菊花
    public ShowChrysanthemum( MsgID )
    {
       if( UIManager.GetUI(UIDefine.UIType.UI_CHRYSANTHEMUM) != null ) return;
        let Msg = MessageConfig.GetMessage( MsgID );
        if( Msg == null ) Msg = "";
        UIManager.ShowUI( UIDefine.UIType.UI_CHRYSANTHEMUM );
       cc.systemEvent.emit( EventName.EVENT_UI_SHOW_CHRYSANTHEMUM_BY_STR , Msg );
    }

    //关闭菊花
    public CloseChrysanthemum(time = null)
    {
        if( time == null) time = 0.3;
        cc.systemEvent.emit( EventName.EVENT_UI_CLOSE_CHRYSANTHEMUM_BY_STR , time );
    }
}
export default ChrysanthemumModule.GetInstance();

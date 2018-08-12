import Singleton from "../../Common/Function/Singleton";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
import EventName from "../../Common/Event/EventName";
//-------------------------------------------------------------------------------------------------
// 消息提示模块
//-------------------------------------------------------------------------------------------------
class MessageModule extends Singleton
{
    //显示消息（通过ID）
    public ShowMessage( MsgID : number )
    {
        UIManager.ShowUI(UIType.UI_MESSAGE);
        cc.systemEvent.emit(EventName.EVENT_UI_SHOW_MESSAGE_BY_ID,MsgID)
    }

    //显示消息（通过str）
    public ShowMessageStr( MsgStr : string )
    {
        UIManager.ShowUI(UIType.UI_MESSAGE);
        cc.systemEvent.emit(EventName.EVENT_UI_SHOW_MESSAGE_BY_STR,MsgStr)
    }
}
export default MessageModule.GetInstance();

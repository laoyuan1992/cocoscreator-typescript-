import UIBase from "../../Common/UI/UIBase";
import UIManager from "../../Common/UI/UIManager";
import GameDefine from "../Module/GameDefine";
import StringHelper from "../../Utility/StringHelper";
import MessageModule from "../../Message/Model/MessageModule";
import Util from "../../Utility/Util";
import ChatModule from "../Module/ChatModule";
import ChatDefines from "../Module/ChatDefines";
import UIChatCell from "./UIChatCell";
import ResourcesManager from "../../Framework/ResourcesManager";

//-------------------------------------------------------------------------------------------------
// 聊天界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UICreateRoom extends UIBase 
{
    @property(cc.Node)
    Grid: cc.Node = null;                            //表情节点

    start()
    {
        for (const key in  ChatDefines.UIChatConfig) {
            if ( ChatDefines.UIChatConfig.hasOwnProperty(key)) 
            {
                const element = ChatDefines.UIChatConfig[key];
                let Cell : cc.Node =  ResourcesManager.LoadPrefab( element.Prefab , this.Grid );
                if( Cell == null ) return;
                Cell.getComponent(UIChatCell).Init(key,element);
            }
        }
            

    }

    private OnClickClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_CHAT.type);
    }

    private OnClickSendContent( Input )
    {
        this.PlayButtonAudio();
        let Value : string = Input.string;
        if("" == Value)
        {
            MessageModule.ShowMessage(85);
            return;
        }
        Value = Value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
         Value = Util.FiltrationEmoji(Value);
        if(Value.length <= 0)
        {
            return;
        }
        ChatModule.SendChatText( Value,1 );
        UIManager.DestroyUI(GameDefine.GameUIConfig.UI_CHAT.type);
        
    }
}
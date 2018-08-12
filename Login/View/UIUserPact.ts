//-------------------------------------------------------------------------------------------------
// 用户协议
//-------------------------------------------------------------------------------------------------
import * as UIDefine from "../../Common/UI/UIDefine"
import UIManager from "../../Common/UI/UIManager";
import MessageConfig from "../../Config/MessageConfig"
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIUserPact extends UIBase 
{

    @property(cc.Label)
    TextPact1: cc.RichText = null;
    @property(cc.Label)
    TextPact2: cc.RichText = null;
    @property(cc.Label)
    TextPact3: cc.RichText = null;
    @property(cc.Label)
    TextPact4: cc.RichText = null;

    start()
    {
        this.TextPact1.string = MessageConfig.GetMessage(95);
        this.TextPact2.string = MessageConfig.GetMessage(96);
        this.TextPact3.string = MessageConfig.GetMessage(97);
        this.TextPact4.string = MessageConfig.GetMessage(98);
    }

    private ClickBtnClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIDefine.UIType.UI_USERPACT);
    }
}


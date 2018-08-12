//-------------------------------------------------------------------------------------------------
// 关于我们
//-------------------------------------------------------------------------------------------------
import * as UIDefine from "../../Common/UI/UIDefine"
import UIManager from "../../Common/UI/UIManager";
import MessageConfig from "../../Config/MessageConfig"
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIAboutUs extends UIBase 
{

    @property(cc.Label)
    TextPact: cc.Label = null;

    start()
    {
        this.TextPact.string = MessageConfig.GetMessage(94);
    }

    private ClickBtnClose()
    {
        this.PlayButtonAudio();
        UIManager.DestroyUI(UIDefine.UIType.UI_ABOUT_US);
    }
}


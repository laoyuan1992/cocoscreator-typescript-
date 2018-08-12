import MessageModule from "../../Message/Model/MessageModule";
import UIManager from "../../Common/UI/UIManager";
import { UIType } from "../../Common/UI/UIDefine";
//-------------------------------------------------------------------------------------------------
// 领钻界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
@ccclass
export default class CollectDiamonds extends cc.Component {

    private OnClickCopys()
    {
        if(window["wx"] == undefined) return;
        window["wx"].setClipboardData({
            data : "地址。。。。",
            success : (res) =>
                {
                    MessageModule.ShowMessage(93);
                    UIManager.DestroyUI(UIType.UI_COLLECT_DIAMONDS);
                }
        })
    }
    
    private OnClickClose()
    {
        UIManager.DestroyUI(UIType.UI_COLLECT_DIAMONDS);
    }
}

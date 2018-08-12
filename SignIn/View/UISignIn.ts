//-------------------------------------------------------------------------------------------------
// 签到界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISignIn extends UIBase 
{
    @property(cc.Button)
    BtnSure: cc.Button = null;

    @property(cc.Button)
    BtnBGClose: cc.Button = null;

    @property(cc.Node)
    Grid: cc.Node = null;

    onLoad() 
	{
	}

    start() 
	{
    }

    update() 
	{
	}
	
	onDestroy()
    {
    }

    private ClickSure()
    {

    }

    private ClickClose()
    {
        
    }
}

//-------------------------------------------------------------------------------------------------
// 签到成功界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UISignInSuccess extends UIBase 
{

    @property(cc.Label)
    Name: cc.Label = null;

    @property(cc.Label)
    Num: cc.Label = null;

    @property(cc.Sprite)
    Image: cc.Sprite = null;

    @property(cc.Button)
    BtnClose: cc.Button = null;

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
}

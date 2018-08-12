//-------------------------------------------------------------------------------------------------
// 兑奖界面
//-------------------------------------------------------------------------------------------------
import UIBase from "../../Common/UI/UIBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIReward extends UIBase 
{
    @property(cc.Button)
    BGClose: cc.Button = null;

    @property(cc.Button)
    BtnClose: cc.Button = null;

    @property(cc.Button)
    BtnAward: cc.Button = null;

    @property(cc.Label)
    TextReward: cc.Label = null;

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

    private ClickClose()
    {

    }

    private ClickAward()
    {

    }
}

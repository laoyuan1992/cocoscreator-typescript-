//-------------------------------------------------------------------------------------------------
// 公告界面
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;
import UIBase from "../../Common/UI/UIBase";

@ccclass
export default class UINotice extends UIBase 
{
    @property(cc.Button)
    BtnClose: cc.Button = null;

    @property(cc.Button)
    BGClose: cc.Button = null;

    @property(cc.Label)
    NoticeContent: cc.Label = null;

    @property(cc.Sprite)
    NoticeTexture: cc.Sprite = null;

    @property([cc.Label])               // 五个公告的标题
    NoticeCaption = [];

    private static _MaxNoticeNums = 5;

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

    private ClickNotice(t)
    {

    }
}

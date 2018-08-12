//-------------------------------------------------------------------------------------------------
// 头像框预制体
//-------------------------------------------------------------------------------------------------
const {ccclass, property} = cc._decorator;

@ccclass
export default class UIPhotoFrameCell extends cc.Component 
{
    @property(cc.Sprite)
    ImgIcon: cc.Sprite = null;

    @property(cc.Label)
    TxtName: cc.Label = null;

    @property(cc.Sprite)
    ImgMask: cc.Sprite = null;

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

    private ClickSelect()
    {

    }
}

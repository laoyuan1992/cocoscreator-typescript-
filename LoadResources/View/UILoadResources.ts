import EventName from "../../Common/Event/EventName";

const {ccclass, property} = cc._decorator;

@ccclass
export default class UILoadResources extends cc.Component {

    @property(cc.Sprite)
    ProgressBar: cc.Sprite = null;

    @property(cc.Node)
    BG: cc.Node = null;

    onLoad () 
    {
        this.ProgressBar.fillRange = 0;
        cc.systemEvent.on(EventName.EVENT_UI_REF_LOADPROGRESS,this.RefreshProgress , this);
        cc.systemEvent.on(EventName.EVENT_UI_LOADCOMPLETED,this.LoadCompleted , this);
        cc.systemEvent.on(EventName.EVENT_UI_STARTLOADRES,this.StartLoadRes , this);
    }

    //开始加载资源
    public StartLoadRes()
    {
        if(this.BG.active == false)
        {
            this.ProgressBar.fillRange = 0;
            this.BG.active = true;
        }
    }

    //刷新进度条
    public RefreshProgress( Num )
    {
        if(Num != null)
        {
            this.ProgressBar.fillRange = Num.detail;
        }
    }

    //加载完成回调
    public LoadCompleted()
    {
        this.BG.active = false;
    }

    onDestroy()
    {
        cc.systemEvent.off(EventName.EVENT_UI_REF_LOADPROGRESS,this.RefreshProgress , this);
        cc.systemEvent.off(EventName.EVENT_UI_LOADCOMPLETED,this.LoadCompleted , this);
        cc.systemEvent.off(EventName.EVENT_UI_STARTLOADRES,this.StartLoadRes , this);
    }

}

import AppFacade from "../../Framework/AppFacade";

//-------------------------------------------------------------------------------------------------
// UI基类
// WHJ
//-------------------------------------------------------------------------------------------------

const {ccclass, property} = cc._decorator;

@ccclass
export default class UIBase extends cc.Component 
{

    onLoad ()
    {
    }

    start () 
    {
    }

    update (dt) 
    {
    }

    //按钮音效
    protected PlayButtonAudio()
    {
        AppFacade.Instance.GetSoundManager().PlaySoundEffect( "anniu" );
    }

}


import EventName from "../Common/Event/EventName"
import Singleton from "../Common/Function/Singleton";
import UIManager from "../Common/UI/UIManager";
import ResourcesManager from "../Framework/ResourcesManager";

class SceneManager extends Singleton
{
    private _LoadSceneFile = "";
    private _LoadParam = null;

    public constructor()
    {
        super();
    }

    public LoadScene( SceneName : string, Param : any )
    {
        this._LoadSceneFile = SceneName;
        this._LoadParam = Param;

        cc.director.loadScene(SceneName, () => {
            cc.sys.garbageCollect();            // 清理无用资源
            
            // 接收此事件的处理方式
            /*
            Func(e)
            {
                eData = e.getUserData();
                cc.log(eData["file"]);
                cc.log(eData["param"]);
            }
            */
            UIManager.ClearAll();
            cc.systemEvent.emit(EventName.EVENT_DO_LOAD_SCENE_COMPLETE, {"file" : this._LoadSceneFile, "param" : this._LoadParam});
        } );
    }

    public GetCurScene() : string
    {
        return this._LoadSceneFile;
    }
}
export default SceneManager.GetInstance();

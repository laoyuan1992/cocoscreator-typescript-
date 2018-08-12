//-------------------------------------------------------------------------------------------------
// 游戏管理器，请参考unity版本中的逻辑
// WHJ
//-------------------------------------------------------------------------------------------------
import UIManager from "../Common/UI/UIManager";
const {ccclass, property} = cc._decorator;
import * as UIDefine from "../Common/UI/UIDefine"
import ResourcesManager from "./ResourcesManager";

@ccclass
export default class GameManager extends cc.Component 
{

    onLoad()
    {
        console.log("GameManager.onLoad");
    }

    start()
    {
        ResourcesManager.LoadAllResources( "Hall" , () => {
            console.log("GameManager.start");
            UIManager.ShowUI(UIDefine.UIType.UI_LOGIN);
        })
    }

    update(dt)
    {
        //console.log("GameManager.update");
    }

    onDestroy()
    {
        console.log("GameManager.onDestroy");
    }

    onEnable()
    {
        console.log("GameManager.onEnable");
    }

    onDisable()
    {
        console.log("GameManager.onDisable");
    }

    onFocusInEditor()
    {
        console.log("GameManager.onFocusInEditor");
    }

    onLostFocusInEditor()
    {
        console.log("GameManager.onLostFocusInEditor");
    }
}

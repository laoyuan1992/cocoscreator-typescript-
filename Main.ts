
import AppFacade from "./Framework/AppFacade";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component 
{
    onLoad () 
    {
    }

    start () 
    {
        AppFacade.Instance.StartUp();
    }
}

//-------------------------------------------------------------------------------------------------
// 一个简单的状态机（参考lua中的simple_state_machine，先实现一个最简单的版本，功能需要不断的完善中...）
// WHJ
//-------------------------------------------------------------------------------------------------
export default class simple_state_machine
{
    // version
    private static readonly VERSION = "2.2.0";
    // the event transitioned successfully from one state to another 
    private static readonly SUCCEEDED = 1;  
    // the event was successfull but no state transition was necessary     
    private static readonly NOTRANSITION = 2;
    // the event was cancelled by the caller in a beforeEvent callback
    private static readonly CANCELLED = 3;
    // the event is asynchronous and the caller is in control of when the transition occurs
    private static readonly PENDING = 4;
    // the event was failure
    private static readonly FAILURE = 5;
    // caller tried to fire an event that was innapropriate in the current state
    private static readonly INVALID_TRANSITION_ERROR = "INVALID_TRANSITION_ERROR";
    // caller tried to fire an event while an async transition was still pending
    private static readonly PENDING_TRANSITION_ERROR = "PENDING_TRANSITION_ERROR";
    // caller provided callback function threw an exception
    private static readonly INVALID_CALLBACK_ERROR = "INVALID_CALLBACK_ERROR";

    private static readonly WILDCARD = "*"; 
    private static readonly ASYNC = "ASYNC";

    // 名称列表
    private _events : any[] = [];
    // 回调列表
    private _callbacks : { [key : string ] : any; } = {};
    private _current = "none";
    // 初始化
    public initialize()
    {
    }

    // 构建
    // 请使用如下参数形式
    /*
        var fsm_param: { [key: string]: any;} = 
        {
            "events" : ["GameStart", 
                        "GameEnd", 
                        "GamePause"],
            "callbacks" : {
                    "onGameStart" : fun_start,
                    "onGameEnd" : fun_end,
                    "onGamePause" : fun_pause
            }
        }
    */
    public setup_state(cfg : any)
    {
        var events = cfg["events"];
        if (events.length == 0)
        { 
            console.log("events is empty!");
            return; 
        }
        // 拷贝事件
        for (let i in events) 
        {       
            this._events[i] = events[i];
        }

        var callbacks = cfg["callbacks"];
        // 拷贝回调
        for(let k in callbacks){  
            this._callbacks[k] = callbacks[k];
        } 
    }

    public do_event(name : any , param ?: any )
    {
        if (!this.contain_event(name))
        {
            console.log("can not find event!");
            return;
        }

        var call_func = this._callbacks["on" + name];
        if (call_func == null)
        {
            console.log("can not find callback!");
            return;
        }
        this._current = name;
        call_func( param );
    }

    private contain_event(name : string) : boolean
    {
        for (let i in this._events) 
        {       
            if (this._events[i] == name)
                return true;
        }

        return false;
    }

    public curr_state()
    {
        return this._current;
    }
}

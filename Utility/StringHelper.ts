//-------------------------------------------------------------------------------------------------
// 字符串帮助类，感觉ts字符串操作系统函数太少，没找到好的解决方案，先加一个类处理着
//-------------------------------------------------------------------------------------------------
export default class StringHelper  
{
    // 格式化字符串(有点麻烦，但没找到系统函数！)
    //  var _str : string = "{0}--------{1}";
    //  FmtString(_str, { "0" : "Hello", "1" : "World"})  -> Hello--------World
    public static FmtString( str : string, args : any ) : string
    {
        var result = str;
        if (arguments.length < 2) {
            return result;
        }
        var data = args;        
        for (var key in data) {
            var value = data[key];
            if (undefined != value) {
                result = result.replace("{" + key + "}", value);
            }
        }
        return result;
    }   

    // PadLeft("4", 3, "0") -> "004"
    public static PadLeft( oriStr : string, len : number, alexin : string ) : string
    {
        var strlen = oriStr.length;
        var str = "";
        if (strlen < len)
        {   
            for (var i = 0; i < len - strlen; i++)
            {  
                 str = str + alexin;  
            }  
        }  
        str = str + oriStr;  
        return str; 
    }

    // PadRight("4", 3, "0") -> "400"
    public static PadRight( oriStr : string, len : number, alexin : string ) : string
    {
        var strlen = oriStr.length;
        var str = "";
        if (strlen < len)
        {   
            for (var i = 0; i < len - strlen; i++)
            {  
                 str = str + alexin;  
            }  
        }  
        str = oriStr + str;  
        return str; 
    }

    // 保留字符串
    public static FiltrationString( experss : string, value : string ) : string
    {
        let str : string = "";
        const exp = new RegExp ( experss, 'g' );
        for ( let idx = 0 ; ; idx++ )
        {
            let temp = exp.exec(value);
            if( temp == null) break;
            str += temp[0];
        }
        return str;
    }

    // 替换指定的字符串
    public static ReplaceString( source : string, oldstr : string , newstr : string )
    {
        for ( let idx = 0; ; idx++ )
        {
            if( source.indexOf(oldstr) == -1 ) break;
            source =  source.replace( oldstr, newstr );
        }
        
        return source;
    }

    public static IntToIP( ipInt :number )
    {
        let sb : string = "";
        sb += ((( ipInt >> 24 ) & 0xFF) + ".");
        sb += ((( ipInt >> 16 ) & 0xFF) + ".");
        sb += ((( ipInt >> 8 ) & 0xFF) + ".");
        sb += (ipInt & 0xFF);
        return sb.toString();
    }
}

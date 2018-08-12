//-------------------------------------------------------------------------------------------------
// http请求
//-------------------------------------------------------------------------------------------------
export default class HttpUtils
{
    // Get
    public HttpGet( url : any, callback : any )
    {
        var xhr = cc.loader.getXMLHttpRequest();  
        xhr.onreadystatechange = function () 
        {  
            if ( xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 300) ) 
            {  
                var respone = xhr.responseText;  
                if ( null != callback )
                    callback( respone );  
            }  
        }; 

        xhr.open( "GET", url, true );  
        if ( cc.sys.isNative ) {  
            xhr.setRequestHeader( "Accept-Encoding", "gzip,deflate" );  
        } 
  
        // note: In Internet Explorer, the timeout property may be set only after calling the open()  
        // method and before calling the send() method.  
        xhr.timeout = 5000;// 5 seconds for timeout  
  
        xhr.send();
    }

    // Post
    public HttpPost( url : any, param : any, callback : any )
    {
        var xhr = cc.loader.getXMLHttpRequest();  
        xhr.onreadystatechange = function () 
        {  
            cc.log( 'xhr.readyState=' + xhr.readyState +' xhr.status=' + xhr.status );  
            if ( xhr.readyState == 4 && ( xhr.status >= 200 && xhr.status < 300 ) ) 
            {  
                var respone = xhr.responseText;  
                cc.log( respone );
                callback( respone );  
            }
            else
            {  
                // 不知道为什么这个地方会必走一次
                callback( -1 );  
            }  
        };  

        xhr.onabort = function()
        {
            cc.log( "onabort!!" );
        };

        xhr.onerror = function() 
        {
            cc.log( "onerror!!" );
        };

        xhr.ontimeout = function() 
        {
            cc.log( "ontimeout!!" );
        }

        xhr.open( "POST", url, true );  
        
        if ( cc.sys.isNative ) 
        {  
            xhr.setRequestHeader( "Accept-Encoding", "gzip,deflate" );  
        }else
        {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()  
        // method and before calling the send() method.  
        xhr.timeout = 5000;// 5 seconds for timeout  
  
        xhr.send( param );  
    }
}

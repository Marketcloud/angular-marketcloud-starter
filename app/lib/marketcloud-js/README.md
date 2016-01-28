# Marketcloud Javascript Client Library
## Installation

Add the javascript sources directly into your web application:
```javascript
<script type="text/javascript" src="dist/marketcloud.min.js"></script>
```
At this point the marketcloud sdk is available as the marketcloud variable:
```javascript
marketcloud.public = 'replace-with-your-public-key';
marketcloud.products.list({},function(err,products) {
//your code here
});
```
## Documentation
For further informations check the [official documentation](http://www.marketcloud.it/documentation/javascript)

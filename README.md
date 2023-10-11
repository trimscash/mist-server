# mist-server
```
#.env
MIST_DIRECTORY="{mist repository directory}"
ALLOW_ORIGIN="{allow origin url}"
```

mist/ is sourced from 
https://github.com/mist-project/mist

change tail of mist_v3.py 
```python
# tail of mist_v3.py
        output = Image.fromarray(output_image.astype(np.uint8))
        output_name = args.output_name
        # save_parameter = '_' + str(epsilon) + '_' + str(steps) + '_' + str(input_size) + '_' + str(block_num) + '_' + str(mode) + '_' + str(args.rate) + '_' + str(int(mask)) + '_' + str(int(resize))
        # output_name += save_parameter + '.png'
        # output_name += '.png'
        print("Output image saved in path {}".format(output_name))
        output.save(output_name)
```

and make directory

```
mist/temp/input
mist/temp/output
```

```
npm install
conda activate mist
npm start
```
# usage
## post /
post base64 decoded image with mime

##### payload
- `image`: base64 decoded image with mime
```
#payload example
{ "image" : "data:image/png;base64,~~~~~~~~~"}
```
##### response
- `image`: base64 decoded image with mime
```
#response example
{ "status":"success", "image" : "data:image/png;base64,~~~~~~~~~"}
```

###### curl
```
curl -X POST http://localhost:4000 -H "Accept: application/json" -H "Content-type: application/json" -d '{ "image" : "data:image/png;base64,~~~~~~~~~"}':
```

## get /
get queue status

##### response
- `active_job` indicates the processing job count 
- `wait_job` indicates the waiting job count  
```
#response example
{"status":"success","message":"now queue state","active_job":1,"wait_job":5}
```




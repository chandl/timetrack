<script>
    import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar';
    import IconButton from '@smui/icon-button';

    let prominent = false;
  let dense = false;
  let secondaryColor = false;
</script>

<section>
    <div class="flexy">
    
        <div class="top-app-bar-container flexor">
          <TopAppBar variant="static" {prominent} {dense} color={secondaryColor ? 'secondary' : 'primary'}>
            <Row>
              <Section>
                <IconButton class="material-icons">menu</IconButton>
                <Title>Time Tracker</Title>
              </Section>
              <Section align="end" toolbar>
                  Report Manager
                  Time Manager
                <!-- <IconButton class="material-icons" aria-label="Download">file_download</IconButton>
                <IconButton class="material-icons" aria-label="Print this page">print</IconButton>
                <IconButton class="material-icons" aria-label="Bookmark this page">bookmark</IconButton> -->
              </Section>
            </Row>
          </TopAppBar>
        </div>
      </div>


</section>


<style>
    .top-app-bar-container, .top-app-bar-iframe {
      max-width: 480px;
      min-width: 480px;
      height: 320px;
      border: 1px solid rgba(0,0,0,.1);
      margin: 0 18px 18px 0;
    }
    .top-app-bar-container {
      overflow: auto;
      display: inline-block;
    }
    .flexy {
      display: flex;
      flex-wrap: wrap;
    }
    .flexor {
      display: inline-flex;
      flex-direction: column;
    }
    .flexor-content {
      flex-basis: 0;
      height: 0;
      flex-grow: 1;
      overflow: auto;
    }
  </style>
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  /*{
    title: 'Easy to Use',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
  },*/  
  {
    title: 'About Me',
    ImgSrc: require('/home/hivemind/Projects/Portfolio-Site/tom-docs/static/img/about-me.jpg').default,
    description: (
      <>
      	<p>
          I’m a network engineer who enjoys learning, building,
          and documenting what I discover along the way. This site serves as a place to organize my projects,
          knowledge-base articles, and notes on technologies I find interesting. 
        </p>
        
        <p>
          You’ll also find a Hobbies section, where I collect writings, notes, and documentation related to interests
          outside of my professional work. It’s a space to explore topics I’m curious about and to record things that I
          find worth learning or remembering.
        </p>
      </>
    ),
  },
];

function Feature({ImgSrc, title, description}) {
  return (
    <div className={clsx('col col--12')}>
      <div className="text--center">
        <img className={styles.featureImg} src={ImgSrc} alt={title} />
      </div>
      <div className={clsx("text--center padding-horiz--md", styles.aboutText)}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
